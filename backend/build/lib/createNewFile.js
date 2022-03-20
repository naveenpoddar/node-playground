"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ContainerInstance_1 = __importDefault(require("./ContainerInstance"));
async function createNewFile(containerIP, path) {
    try {
        const containerInstance = (0, ContainerInstance_1.default)(containerIP);
        await containerInstance.post(`/create-file?path=${path}`);
    }
    catch (e) {
        console.log(e?.response?.data);
    }
}
exports.default = createNewFile;
