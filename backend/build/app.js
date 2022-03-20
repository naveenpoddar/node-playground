"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dockerode_1 = __importDefault(require("dockerode"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const connect_1 = __importDefault(require("./lib/connect"));
const uuid_1 = require("uuid");
const socket_1 = __importDefault(require("./routes/socket"));
const Browser_model_1 = __importDefault(require("./models/Browser.model"));
const Playground_model_1 = __importDefault(require("./models/Playground.model"));
const app = (0, express_1.default)();
const server = new http_1.default.Server(app);
const docker = new dockerode_1.default();
app.use((0, cors_1.default)({ origin: config_1.CORS_ORIGINS, credentials: true }));
app.get("/", async (req, res) => {
    let browserId = req.query.browserId;
    if (!browserId) {
        browserId = (0, uuid_1.v4)();
        await Browser_model_1.default.create({ id: browserId });
    }
    return res.send(browserId);
});
app.get("/create-playground", async (req, res) => {
    const browserId = req.query.browserId;
    const browser = await Browser_model_1.default.findOne({ id: browserId });
    const templateId = req.query.templateId;
    if (!browser)
        return res.status(404).send("Browser not found");
    const playground = await Playground_model_1.default.create({
        templateId,
    });
    browser.playgrounds.push(playground._id);
    await browser.save();
    return res.send(playground.playgroundId);
});
server.listen(config_1.SERVER_PORT, async () => {
    console.log("Server is listening on port 4000");
    await (0, connect_1.default)();
    (0, socket_1.default)(server);
});
// When the server is closed all the containers which are running will be killed and removed
process.on("exit", async () => {
    const containers = await docker.listContainers();
    containers.forEach(async (containerInfo) => {
        const container = docker.getContainer(containerInfo.Id);
        await container.kill();
        await container.remove({ force: true });
    });
});
