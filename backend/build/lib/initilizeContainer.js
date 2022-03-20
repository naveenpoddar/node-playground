"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dockerode_1 = __importDefault(require("dockerode"));
const config_1 = require("../config");
const getContainerIP_1 = __importDefault(require("./getContainerIP"));
const docker = new dockerode_1.default();
async function initilizeContainer({ template }) {
    const image = await docker.getImage(`${template}:latest`);
    if (!image)
        throw Error(`Image ${template} not found`);
    const container = await docker.createContainer({
        Image: `${template}:latest`,
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ["/bin/bash", "-c", "cd /tmp/server && npm start"],
        OpenStdin: false,
        StdinOnce: false,
    });
    await container.start();
    let active = false;
    const ip = await (0, getContainerIP_1.default)(container);
    const endpoint = `http://${ip}:${config_1.CONTAINER_PORT}/files`;
    async function pingContainer() {
        try {
            await axios_1.default.get(endpoint);
            active = true;
        }
        catch (e) {
            return;
        }
    }
    do {
        await pingContainer();
        await new Promise((resolve) => setTimeout(resolve, 1000));
    } while (!active);
    return container;
}
exports.default = initilizeContainer;
