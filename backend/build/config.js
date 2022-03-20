"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONGO_URI = exports.CONTAINER_PORT = exports.EXPOSED_PORT = exports.CORS_ORIGINS = exports.SERVER_PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.SERVER_PORT = 4000;
exports.CORS_ORIGINS = ["http://localhost:3000"];
exports.EXPOSED_PORT = "5858";
exports.CONTAINER_PORT = "7777";
exports.MONGO_URI = process.env.MONGO_URI;
