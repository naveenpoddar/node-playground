"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const ContainerInstance = (containerID, generic = false) => {
    if (!containerID) {
        logger.error("Container ID is not valid: " + containerID || "null");
        throw new Error("Container ID is not valid: ");
    }
    if (generic) {
        return axios_1.default.create({
            baseURL: `http://${containerID}:${config_1.CONTAINER_PORT}`,
            withCredentials: true,
        });
    }
    return axios_1.default.create({
        baseURL: `${config_1.SERVER_URL}/containers/${containerID}`,
        withCredentials: true,
    });
};
exports.default = ContainerInstance;
