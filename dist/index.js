"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.allTimejobs = void 0;
const express_1 = __importStar(require("express"));
const jobsService_1 = __importDefault(require("./services/jobsService"));
const cors_1 = __importDefault(require("cors"));
const moment_1 = __importDefault(require("moment"));
const node_notifier_1 = __importDefault(require("node-notifier"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// JSON Parser Middleware
app.use((0, express_1.json)());
app.use((0, cors_1.default)());
//asds
// Routers Middleware
app.get('/jobs', (req, res) => {
    const jobs = exports.allTimejobs.map(x => {
        return Object.assign(Object.assign({}, x), { timeAgo: x.time.fromNow() });
    }).sort((left, right) => {
        return moment_1.default.utc(left.timeStamp).diff(moment_1.default.utc(right.timeStamp));
    });
    return res.send({
        count: exports.allTimejobs.length,
        jobs
    });
});
exports.allTimejobs = [];
(0, jobsService_1.default)();
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newJobs = yield (0, jobsService_1.default)();
        console.log(newJobs);
        newJobs === null || newJobs === void 0 ? void 0 : newJobs.forEach((x) => {
            console.log(x);
            const z = node_notifier_1.default.notify({
                message: x.body,
                title: x.title + ' ' + x.price
            });
            fetch('https://api.telegram.org/bot7323289180:AAE8ZPIrCvmhVqf3elqtzxcEZgx2cwKbncE/sendMessage', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "chat_id": '945827738',
                    "text": `${x.title} - ${x.price} \n ${x.body} \n\n ${x.timeAgo} \n\n ${x.link}`
                })
            });
        });
    }
    catch (e) {
        console.log(e);
    }
}), 120000);
app.listen(port, () => {
    console.log('Server listening on port: ' + port);
});
function update(newJobs) {
    exports.allTimejobs = newJobs;
}
exports.update = update;
