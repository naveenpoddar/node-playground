"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dockerode_1 = __importDefault(require("dockerode"));
const lodash_1 = require("lodash");
const config_1 = require("./config");
const checkPlayground_1 = __importDefault(require("./lib/checkPlayground"));
const ContainerInstance_1 = __importDefault(require("./lib/ContainerInstance"));
const createNewFile_1 = __importDefault(require("./lib/createNewFile"));
const getContainerIP_1 = __importDefault(require("./lib/getContainerIP"));
const getFilesList_1 = __importDefault(require("./lib/getFilesList"));
const initilizeContainer_1 = __importDefault(require("./lib/initilizeContainer"));
const saveFileToContainer_1 = __importDefault(require("./lib/saveFileToContainer"));
const startTerminalSession_1 = __importDefault(require("./lib/startTerminalSession"));
const Playground_model_1 = __importDefault(require("./models/Playground.model"));
const docker = new dockerode_1.default();
class IPlayground {
    constructor(id, browserId, socket) {
        this.id = id;
        this.browserId = browserId;
        this.socket = socket;
    }
    get containerId() {
        return this.dockerContainer.id;
    }
    get ipAddress() {
        return this.playgroundObj.containerIP;
    }
    get url() {
        return `${config_1.SERVER_URL}/${this.playgroundObj.viewId}`;
    }
    get instance() {
        return this.containerId ? (0, ContainerInstance_1.default)(this.containerId) : null;
    }
    async genericInstance() {
        return this.containerId
            ? (0, ContainerInstance_1.default)(await (0, getContainerIP_1.default)(this.dockerContainer), true)
            : null;
    }
    async getRuntimeConfig() {
        try {
            const { data } = await this.instance.get("/file", {
                params: {
                    path: "rc.json",
                },
            });
            return JSON.parse(data.content);
        }
        catch (e) {
            logger.error("GetRCConfig: " + e);
            return {};
        }
    }
    async fetchPlaygroundObj() {
        const playgroundObj = await (0, checkPlayground_1.default)(this.id, this.browserId);
        if (!playgroundObj) {
            logger.error("Playground not found: " + this.id);
            throw new Error("Playground not found");
        }
        this.playgroundObj = playgroundObj;
        return playgroundObj;
    }
    isNew() {
        return !this.playgroundObj.initilized;
    }
    async initilizeEmptyPlayground() {
        this.playgroundObj.initilized = true;
        this.dockerContainer = await (0, initilizeContainer_1.default)({
            template: config_1.EMPTY_PLAYGROUND_TEMPLATE_ID,
        });
    }
    async initilizePlaygroundWithTemplate(templateId) {
        this.playgroundObj.initilized = true;
        this.playgroundObj.templateId = templateId;
        this.dockerContainer = await (0, initilizeContainer_1.default)({
            template: templateId,
        });
    }
    async loadFilesToPlayground() {
        try {
            const instance = await this.genericInstance();
            if (!instance) {
                logger.error("Instance is not initialized");
                throw new Error("Instance is not initialized");
            }
            if (!this.playgroundObj.files)
                return;
            await instance.post("/load-backup", this.playgroundObj.files);
        }
        catch (e) {
            logger.error("Error loading files to playground: " + e);
            throw new Error("Error loading files to playground");
        }
    }
    async syncPlaygroundWithDB() {
        this.playgroundObj.containerIP = await (0, getContainerIP_1.default)(this.dockerContainer);
        this.playgroundObj.url = this.url;
        this.playgroundObj.containerId = this.dockerContainer.id;
        await this.playgroundObj.save();
    }
    emitPlaygroundInfo() {
        this.socket.emit("playground-info", {
            containerId: this.containerId,
            url: this.url,
            containerIP: this.ipAddress,
        });
    }
    async startPlaygroundOnClient() {
        this.emitPlaygroundInfo();
        await (0, startTerminalSession_1.default)(this.dockerContainer, this.socket, async () => {
            // Aftet the Terminal has initilized
            const config = await this.getRuntimeConfig();
            const installScript = (0, lodash_1.get)(config, "install");
            installScript && this.socket.emit("scripts:install", installScript);
        });
        await this.refreshFileContents();
        this.socket.on("file-save", async (data) => {
            this.onFileSave(data);
        });
        this.socket.on("new-file", async (path) => {
            this.onNewFile(path);
        });
        this.socket.on("refresh", () => this.refreshFileContents());
        this.socket.on("disconnect", () => this.onDisconnect());
    }
    async refreshFileContents() {
        try {
            const files = await (0, getFilesList_1.default)(this.containerId);
            this.socket.emit("files", files);
        }
        catch (e) {
            logger.error("GetFilesList: " + e);
        }
    }
    /** Events :] */
    async onFileSave(data) {
        try {
            const { path, code } = data;
            (0, saveFileToContainer_1.default)(this.containerId, path, code);
            await this.refreshFileContents();
        }
        catch (e) {
            logger.error("FileSave: " + e);
        }
    }
    async onNewFile(path) {
        try {
            await (0, createNewFile_1.default)(this.containerId, path);
            await this.refreshFileContents();
        }
        catch (e) {
            logger.error("NewFile: " + e);
        }
    }
    async onDisconnect() {
        const { data: files } = await this.instance.get("/backup-files");
        await Playground_model_1.default.findByIdAndUpdate(this.playgroundObj._id, {
            initilized: true,
            files,
            containerId: null,
            containerIP: null,
            url: null,
        });
        const container = docker.getContainer(this.containerId);
        await container.kill();
        await container.remove({ force: true });
    }
}
exports.default = IPlayground;
