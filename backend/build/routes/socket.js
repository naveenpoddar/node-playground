"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dockerode_1 = __importDefault(require("dockerode"));
const socket_io_1 = require("socket.io");
const config_1 = require("../config");
const checkPlayground_1 = __importDefault(require("../lib/checkPlayground"));
const ContainerInstance_1 = __importDefault(require("../lib/ContainerInstance"));
const createNewFile_1 = __importDefault(require("../lib/createNewFile"));
const getContainerIP_1 = __importDefault(require("../lib/getContainerIP"));
const getFilesList_1 = __importDefault(require("../lib/getFilesList"));
const initilizeContainer_1 = __importDefault(require("../lib/initilizeContainer"));
const saveFileToContainer_1 = __importDefault(require("../lib/saveFileToContainer"));
const startTerminalSession_1 = __importDefault(require("../lib/startTerminalSession"));
const Playground_model_1 = __importDefault(require("../models/Playground.model"));
const docker = new dockerode_1.default();
function initilizeWebSocket(server) {
    const io = new socket_io_1.Server(server);
    io.on("connection", async (socket) => {
        let playgroundId = socket.handshake.query.playgroundId;
        let browserId = socket.handshake.query.browserId;
        const playground = await (0, checkPlayground_1.default)(playgroundId, browserId);
        if (!playground)
            return socket.disconnect();
        let container = await (0, initilizeContainer_1.default)({
            template: playground.templateId,
        });
        let containerIP = await (0, getContainerIP_1.default)(container);
        let containerUrl = `http://${containerIP}:${config_1.EXPOSED_PORT}`;
        let retryCount = 0;
        async function loadFiles() {
            try {
                retryCount++;
                const containerInstance = (0, ContainerInstance_1.default)(containerIP);
                await containerInstance.post("/load-backup", playground?.files);
            }
            catch (e) {
                if (retryCount < 5) {
                    setTimeout(loadFiles, 1000);
                }
            }
        }
        if (!playground.initilized) {
            playground.initilized = true;
            await playground.save();
        }
        else {
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
                const files = await (0, getFilesList_1.default)(containerIP);
                socket.emit("files", files);
            }
            catch (e) {
                setTimeout(refreshFileContents, 1000);
            }
        }
        socket.on("file-save", async (data) => {
            const { path, code } = data;
            (0, saveFileToContainer_1.default)(containerIP, path, code);
            await refreshFileContents();
        });
        socket.on("new-file", async (path) => {
            console.log(path);
            const d = await (0, createNewFile_1.default)(containerIP, path);
            console.log("created", d);
            await refreshFileContents();
        });
        refreshFileContents();
        socket.on("refresh", async () => {
            await refreshFileContents();
        });
        (0, startTerminalSession_1.default)(container, socket);
        /** When the user disconnects the server will delete their container */
        socket.on("disconnect", async () => {
            if (!playground.containerIP || !playground.containerId)
                return;
            console.log("user leaving bruh");
            const containerInstance = (0, ContainerInstance_1.default)(playground.containerIP);
            console.log("instance initilized");
            const { data: files } = await containerInstance.get("/backup-files");
            await Playground_model_1.default.findByIdAndUpdate(playground._id, {
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
exports.default = initilizeWebSocket;
