"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPTY_PLAYGROUND_TEMPLATE_ID = exports.MONGO_URI = exports.CONTAINER_PORT = exports.EXPOSED_PORT = exports.SERVER_URL = exports.CORS_ORIGINS = exports.SERVER_PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.SERVER_PORT = 4000;
exports.CORS_ORIGINS = [
    "http://localhost:3000",
    "http://3.109.143.126:3000",
];
// export const SERVER_URL = `http://3.109.143.126:${SERVER_PORT}`;
exports.SERVER_URL = `http://localhost:${exports.SERVER_PORT}`;
exports.EXPOSED_PORT = 5858;
exports.CONTAINER_PORT = 7777;
exports.MONGO_URI = process.env.MONGO_URI;
exports.EMPTY_PLAYGROUND_TEMPLATE_ID = "node-playground";
