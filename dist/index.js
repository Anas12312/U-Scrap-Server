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
const puppeteer_1 = __importDefault(require("puppeteer"));
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
puppeteer_1.default.launch({
    headless: false,
    timeout: 300000,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
}).then((browser) => __awaiter(void 0, void 0, void 0, function* () {
    yield browser.close();
    let firstTime = false;
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!firstTime) {
                const newJobs = yield (0, jobsService_1.default)('https://www.upwork.com/nx/search/jobs/?amount=0-99,100-499,500-999&contractor_tier=1,2&payment_verified=1&proposals=0-4,5-9,10-14&q=javascript&t=0,1', browser, 'JAVASCRIPT');
                firstTime = true;
                console.log(newJobs.map(j => j.title));
                return;
            }
            const newJobs = yield (0, jobsService_1.default)('https://www.upwork.com/nx/search/jobs/?amount=0-99,100-499,500-999&contractor_tier=1,2&payment_verified=1&proposals=0-4,5-9,10-14&q=javascript&t=0,1', browser, 'JAVASCRIPT');
            console.log("js jobs");
            console.log(newJobs);
            newJobs === null || newJobs === void 0 ? void 0 : newJobs.forEach((x) => {
                // const z = nodeNotifier.notify({
                //     message: x.body,
                //     title: x.title + ' ' + x.price
                // })
                sendTelegram(x);
            });
        }
        catch (e) {
            console.log(e);
        }
    }), 120000);
}));
puppeteer_1.default.launch({
    headless: false,
    timeout: 300000,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
}).then((browser2) => __awaiter(void 0, void 0, void 0, function* () {
    yield browser2.close();
    let firtsTime2 = false;
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!firtsTime2) {
                yield (0, jobsService_1.default)('https://www.upwork.com/nx/search/jobs/?amount=0-99,100-499,500-999&contractor_tier=1,2&payment_verified=1&proposals=0-4,5-9,10-14&q=scrapping&t=0,1', browser2, 'SCRAPE');
                firtsTime2 = true;
                return;
            }
            const newJobs = yield (0, jobsService_1.default)('https://www.upwork.com/nx/search/jobs/?amount=0-99,100-499,500-999&contractor_tier=1,2&payment_verified=1&proposals=0-4,5-9,10-14&q=scrapping&t=0,1', browser2, 'SCRAPE');
            console.log("scrap jobs");
            console.log(newJobs);
            newJobs === null || newJobs === void 0 ? void 0 : newJobs.forEach((x) => {
                sendTelegram(x);
            });
        }
        catch (e) {
            console.log(e);
        }
    }), 120000);
}));
app.listen(port, () => {
    console.log('Server listening on port: ' + port);
});
function update(newJobs) {
    exports.allTimejobs = newJobs;
}
exports.update = update;
const sendTelegram = (x) => {
    fetch('https://api.telegram.org/bot7323289180:AAE8ZPIrCvmhVqf3elqtzxcEZgx2cwKbncE/sendMessage', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "chat_id": 1379446055,
            "text": `${x.title} - ${x.price} \n ${x.body} \n\n ${x.timeAgo} \n\n ${x.type} \n\n ${x.link}`
        })
    });
};
