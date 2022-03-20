"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ContainerInstance_1 = __importDefault(require("./ContainerInstance"));
async function getFilesList(containerID, path = "/app") {
    const containerInstance = (0, ContainerInstance_1.default)(containerID);
    const { data } = await containerInstance.get("/files", {
        params: {
            path,
        },
    });
    let files = [];
    for (let i = 0; i < data.length; i++) {
        const file = data[i];
        if (file.isDirectory) {
            files.push({
                ...file,
                files: await getFilesList(containerID, `${path}/${file.name}`),
            });
        }
        else {
            files.push(file);
        }
    }
    // Sorts the files array by name and directories first
    return files.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) {
            return -1;
        }
        if (!a.isDirectory && b.isDirectory) {
            return 1;
        }
        return a.name.localeCompare(b.name);
    });
}
exports.default = getFilesList;
