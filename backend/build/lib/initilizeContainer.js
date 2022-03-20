"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dockerode_1 = __importDefault(require("dockerode"));
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
    return container;
}
exports.default = initilizeContainer;
