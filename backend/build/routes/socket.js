"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const IPlayground_1 = __importDefault(require("../IPlayground"));
function initilizeWebSocket(server) {
    const io = new socket_io_1.Server(server);
    io.on("connection", async (socket) => {
        let intervalId = null;
        try {
            const playgroundId = socket.handshake.query
                .playgroundId;
            const browserId = socket.handshake.query.browserId;
            const playground = new IPlayground_1.default(playgroundId, browserId, socket);
            await playground.fetchPlaygroundObj();
            if (playground.isNew()) {
                await playground.initilizePlaygroundWithTemplate(playground.playgroundObj.templateId);
            }
            else {
                await playground.initilizeEmptyPlayground();
                await playground.loadFilesToPlayground();
            }
            await playground.syncPlaygroundWithDB();
            await playground.startPlaygroundOnClient();
            intervalId = setInterval(async () => {
                await playground.refreshFileContents();
            }, 10000);
        }
        catch (e) {
            logger.error("Something went wrong: " + e);
            intervalId && clearInterval(intervalId);
        }
    });
}
exports.default = initilizeWebSocket;
