"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserClass = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const uuid_1 = require("uuid");
const Playground_model_1 = require("./Playground.model");
class BrowserClass {
}
__decorate([
    (0, typegoose_1.prop)({ required: true, default: () => (0, uuid_1.v4)() }),
    __metadata("design:type", String)
], BrowserClass.prototype, "id", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, default: [], ref: Playground_model_1.PlaygroundClass }),
    __metadata("design:type", Array)
], BrowserClass.prototype, "playgrounds", void 0);
exports.BrowserClass = BrowserClass;
const Browser = (0, typegoose_1.getModelForClass)(BrowserClass);
exports.default = Browser;
