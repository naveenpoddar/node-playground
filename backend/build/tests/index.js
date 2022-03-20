"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utf8_1 = __importDefault(require("utf8"));
const str = "\x01\x00\x00\x00\x00\x00\x00\x1E";
console.log(utf8_1.default.encode(str));
