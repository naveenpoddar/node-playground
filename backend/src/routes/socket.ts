import Docker, { Container } from "dockerode";
import http from "http";
import { get } from "lodash";
import { Server } from "socket.io";
import { EXPOSED_PORT } from "../config";
import checkPlayground from "../lib/checkPlayground";
import ContainerInstance from "../lib/ContainerInstance";
import createNewFile from "../lib/createNewFile";
import getContainerIP from "../lib/getContainerIP";
import getFilesList from "../lib/getFilesList";
import initilizeContainer from "../lib/initilizeContainer";
import saveFileToContainer from "../lib/saveFileToContainer";
import startTerminalSession from "../lib/startTerminalSession";
import Browser from "../models/Browser.model";
import Playground from "../models/Playground.model";

const docker = new Docker();

export default function initilizeWebSocket(server: http.Server) {
  const io = new Server(server);

  io.on("connection", async (socket) => {
    let playgroundId: string = socket.handshake.query.playgroundId as string;
    let browserId: string = socket.handshake.query.browserId as string;

    const playground = await checkPlayground(playgroundId, browserId);
    if (!playground) return socket.disconnect();

    let container = await initilizeContainer({
      template: playground.templateId,
    });
    let containerIP = await getContainerIP(container);
    let containerUrl = `http://${containerIP}:${EXPOSED_PORT}`;

    let retryCount = 0;

    async function loadFiles() {
      try {
        retryCount++;
        const containerInstance = ContainerInstance(containerIP);
        await containerInstance.post("/load-backup", playground?.files);
      } catch (e) {
        if (retryCount < 5) {
          setTimeout(loadFiles, 1000);
        }
      }
    }

    if (!playground.initilized) {
      playground.initilized = true;
      await playground.save();
    } else {
      await loadFiles();
    }

    playground.containerId = container.id;
    playground.containerIP = containerIP;
    playground.url = containerUrl;

    socket.emit("playground-info", {
      containerId: container.id,
      url: containerUrl,
      containerIP,
    });

    async function refreshFileContents() {
      try {
        const files = await getFilesList(containerIP);
        socket.emit("files", files);
      } catch (e) {
        setTimeout(refreshFileContents, 1000);
      }
    }

    socket.on("file-save", async (data) => {
      const { path, code } = data;
      saveFileToContainer(containerIP, path, code);
      await refreshFileContents();
    });

    socket.on("new-file", async (path: string) => {
      console.log(path);
      const d = await createNewFile(containerIP, path);
      console.log("created", d);
      await refreshFileContents();
    });

    refreshFileContents();

    socket.on("refresh", async () => {
      await refreshFileContents();
    });

    startTerminalSession(container, socket);

    /** When the user disconnects the server will delete their container */
    socket.on("disconnect", async () => {
      if (!playground.containerIP || !playground.containerId) return;
      console.log("user leaving bruh");
      const containerInstance = ContainerInstance(playground.containerIP);
      console.log("instance initilized");
      const { data: files } = await containerInstance.get("/backup-files");
      await Playground.findByIdAndUpdate(playground._id, {
        initilized: true,
        files,
        containerId: null,
        containerIP: null,
        url: null,
      });
      console.log("saved");

      const container = docker.getContainer(playground.containerId);
      await container.kill();
      await container.remove({ force: true });
      await playground.save();
      return console.log(socket.id, "Disconnected", container.id);
    });
  });
}
