"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ContainerInstance_1 = __importDefault(require("./ContainerInstance"));
async function saveFileToContainer(containerID, path, content) {
    try {
        const containerInstance = (0, ContainerInstance_1.default)(containerID);
        const { data } = await containerInstance.post(`/save-file`, {
            path,
            content,
        });
        return data;
    }
    catch (err) {
        console.log(err?.response?.data);
        return null;
    }
}
exports.default = saveFileToContainer;
