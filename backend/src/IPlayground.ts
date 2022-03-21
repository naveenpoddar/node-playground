import { DocumentType } from "@typegoose/typegoose";
import Docker, { Container } from "dockerode";
import { get } from "lodash";
import { Socket } from "socket.io";
import { EMPTY_PLAYGROUND_TEMPLATE_ID, SERVER_URL } from "./config";
import checkPlayground from "./lib/checkPlayground";
import ContainerInstance from "./lib/ContainerInstance";
import createNewFile from "./lib/createNewFile";
import getContainerIP from "./lib/getContainerIP";
import getFilesList from "./lib/getFilesList";
import initilizeContainer from "./lib/initilizeContainer";
import saveFileToContainer from "./lib/saveFileToContainer";
import startTerminalSession from "./lib/startTerminalSession";
import Playground, { PlaygroundClass } from "./models/Playground.model";

const docker = new Docker();

export default class IPlayground {
  public playgroundObj!: DocumentType<PlaygroundClass>;
  public dockerContainer!: Container;

  public get containerId(): string | undefined {
    return this.dockerContainer.id;
  }
  public get ipAddress() {
    return this.playgroundObj.containerIP;
  }
  public get url(): string {
    return `${SERVER_URL}/${this.playgroundObj.viewId}`;
  }
  public get instance(): ReturnType<typeof ContainerInstance> | null {
    return this.containerId ? ContainerInstance(this.containerId) : null;
  }

  public async genericInstance() {
    return this.containerId
      ? ContainerInstance(await getContainerIP(this.dockerContainer), true)
      : null;
  }

  public async getRuntimeConfig() {
    try {
      const instance = await this.genericInstance();
      console.log(instance?.defaults);
      if (!instance) return;
      const { data } = await instance.get("/file", {
        params: {
          path: "rc.json",
        },
      });

      return JSON.parse(data.content);
    } catch (e) {
      logger.error("GetRuntimeConfig: " + e);
      return {};
    }
  }

  public constructor(
    public id: string,
    public browserId: string,
    public socket: Socket
  ) {}

  public async fetchPlaygroundObj() {
    const playgroundObj = await checkPlayground(this.id, this.browserId);
    if (!playgroundObj) {
      logger.error("Playground not found: " + this.id);
      throw new Error("Playground not found");
    }

    this.playgroundObj = playgroundObj;
    return playgroundObj;
  }

  public isNew(): boolean {
    return !this.playgroundObj.initilized;
  }

  public async initilizeEmptyPlayground() {
    this.playgroundObj.initilized = true;
    this.dockerContainer = await initilizeContainer({
      template: EMPTY_PLAYGROUND_TEMPLATE_ID,
    });
  }

  public async initilizePlaygroundWithTemplate(templateId: string) {
    this.playgroundObj.initilized = true;
    this.playgroundObj.templateId = templateId;
    this.dockerContainer = await initilizeContainer({
      template: templateId,
    });
  }

  public async loadFilesToPlayground() {
    try {
      const instance = await this.genericInstance();
      if (!instance) {
        logger.error("Instance is not initialized");
        throw new Error("Instance is not initialized");
      }
      if (!this.playgroundObj.files) return;

      await instance.post("/load-backup", this.playgroundObj.files);
    } catch (e) {
      logger.error("Error loading files to playground: " + e);
      throw new Error("Error loading files to playground");
    }
  }

  public async syncPlaygroundWithDB() {
    this.playgroundObj.containerIP = await getContainerIP(this.dockerContainer);
    this.playgroundObj.url = this.url;
    this.playgroundObj.containerId = this.dockerContainer.id;
    await this.playgroundObj.save();
  }

  public emitPlaygroundInfo() {
    this.socket.emit("playground-info", {
      containerId: this.containerId,
      url: this.url,
      containerIP: this.ipAddress,
    });
  }

  public async startPlaygroundOnClient() {
    this.emitPlaygroundInfo();

    await startTerminalSession(this.dockerContainer, this.socket, async () => {
      // Aftet the Terminal has initilized
      const config = await this.getRuntimeConfig();
      const installScript: string = get(config, "install");
      installScript && this.socket.emit("scripts:install", installScript);

      this.socket.on("get-script:run", () => {
        const runScript: string = get(config, "run");
        runScript && this.socket.emit("scripts:run", runScript);
      });
    });

    await this.refreshFileContents();

    this.socket.on("file-save", async (data) => {
      this.onFileSave(data);
    });

    this.socket.on("new-file", async (path: string) => {
      this.onNewFile(path);
    });

    this.socket.on("refresh", () => this.refreshFileContents());

    this.socket.on("disconnect", () => this.onDisconnect());
  }

  public async refreshFileContents() {
    try {
      const files = await getFilesList(this.containerId!);
      this.socket.emit("files", files);
    } catch (e) {
      // logger.error("GetFilesList: " + e);
    }
  }

  /** Events :] */
  public async onFileSave(data: { path: string; code: string }) {
    try {
      const { path, code } = data;
      saveFileToContainer(this.containerId!, path, code);
      await this.refreshFileContents();
    } catch (e) {
      logger.error("FileSave: " + e);
    }
  }

  public async onNewFile(path: string) {
    try {
      await createNewFile(this.containerId!, path);
      await this.refreshFileContents();
    } catch (e) {
      logger.error("NewFile: " + e);
    }
  }

  public async onDisconnect() {
    const { data: files } = await this.instance!.get("/backup-files");
    await Playground.findByIdAndUpdate(this.playgroundObj!._id, {
      initilized: true,
      files,
      containerId: null,
      containerIP: null,
      url: null,
    });
    const container = docker.getContainer(this.containerId!);
    await container.kill();
    await container.remove({ force: true });
  }
}
