"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Browser_model_1 = __importDefault(require("../models/Browser.model"));
const Playground_model_1 = __importDefault(require("../models/Playground.model"));
async function checkPlayground(playgroundId, browserId) {
    const playground = await Playground_model_1.default.findOne({ playgroundId });
    if (!playground)
        return;
    const browser = await Browser_model_1.default.findOne({
        id: browserId,
    }).lean();
    if (!browser)
        return;
    const playgroundExsistsInBrowser = browser.playgrounds.find((pid) => pid?.toString() === playground._id.toString());
    if (!playgroundExsistsInBrowser)
        return;
    return playground;
}
exports.default = checkPlayground;
