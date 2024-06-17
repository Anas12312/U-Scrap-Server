"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CustomError_1 = __importDefault(require("./CustomError"));
class BadRequest extends CustomError_1.default {
    constructor(message = '', validations = []) {
        super('BadRequestError', message);
        this.name = 'BadRequestError';
        this.message = message;
        this.validations = validations;
    }
}
exports.default = BadRequest;
