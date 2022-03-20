"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const dayjs_1 = __importDefault(require("dayjs"));
const logger = (0, pino_1.default)({
    customLevels: {
        INCOMING_REQUEST: 25,
        INCOMING_REQUEST_ERROR: 26,
    },
    transport: {
        target: "pino-pretty",
    },
    base: {
        pid: false,
    },
    timestamp: () => `,"time":"${(0, dayjs_1.default)().format("DD MMM hh:mm:ss A")}"`,
});
logger;
exports.default = logger;
