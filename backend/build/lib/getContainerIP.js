"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function getContainerIP(container) {
    const inspect = await container.inspect();
    const networkSettings = inspect.NetworkSettings;
    const ip = networkSettings.IPAddress;
    return ip;
}
exports.default = getContainerIP;
