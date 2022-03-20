"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const ContainerInstance = (containerIP) => {
    return axios_1.default.create({
        baseURL: `http://${containerIP}:${config_1.CONTAINER_PORT}`,
        withCredentials: true,
    });
};
exports.default = ContainerInstance;
