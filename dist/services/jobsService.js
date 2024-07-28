"use strict";
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
const puppeteer_1 = __importDefault(require("puppeteer"));
const __1 = require("..");
const __2 = require("..");
const moment_1 = __importDefault(require("moment"));
function scrap() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const browser = yield puppeteer_1.default.launch({
            // headless: false,
            timeout: 300000,
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote",
            ],
            executablePath: process.env.NODE_ENV === "production"
                ? process.env.PUPPETEER_EXECUTABLE_PATH
                : puppeteer_1.default.executablePath(),
        });
        const page = yield browser.newPage();
        yield page.goto('https://www.upwork.com/nx/search/jobs/?amount=0-99,100-499,500-999&contractor_tier=1,2&payment_verified=1&proposals=0-4,5-9,10-14&q=javascript&t=1');
        // await page.waitForNetworkIdle()
        const articles = yield page.$$('article');
        const jobs = [];
        for (let article of articles) {
            const title = yield article.$(".job-tile .up-n-link");
            const titleText = yield (title === null || title === void 0 ? void 0 : title.evaluate((t) => {
                return t.textContent;
            }));
            const link = yield (title === null || title === void 0 ? void 0 : title.evaluate((t) => {
                return t.getAttribute('href');
            }));
            const listElement = yield article.$(".job-tile-info-list");
            const itemElement = (_a = (yield (listElement === null || listElement === void 0 ? void 0 : listElement.$$("li")))) === null || _a === void 0 ? void 0 : _a.at(2);
            const strongElement = (_b = (yield (itemElement === null || itemElement === void 0 ? void 0 : itemElement.$$("strong")))) === null || _b === void 0 ? void 0 : _b.at(1);
            const price = yield (strongElement === null || strongElement === void 0 ? void 0 : strongElement.evaluate((s) => {
                return s.textContent;
            }));
            const bodyElement = yield article.$("p");
            const body = yield (bodyElement === null || bodyElement === void 0 ? void 0 : bodyElement.evaluate((b) => {
                return b.textContent;
            }));
            const headerElement = yield article.$(".job-tile-header");
            const spanElement = (_c = (yield (headerElement === null || headerElement === void 0 ? void 0 : headerElement.$$("span")))) === null || _c === void 0 ? void 0 : _c.at(1);
            const time = yield (spanElement === null || spanElement === void 0 ? void 0 : spanElement.evaluate((s) => {
                return s.textContent;
            }));
            // console.log("--------------------------------")
            // console.log(titleText)
            // console.log(link)
            // console.log(price)
            // console.log(body)
            // console.log(time)
            const existing = __1.allTimejobs.map((j) => j.link);
            if (existing.includes("https://www.upwork.com" + link))
                return;
            jobs.push({
                title: "" + titleText,
                price: "" + price,
                body: "" + body,
                link: "https://www.upwork.com" + link,
                timeAgo: time
            });
        }
        yield browser.close();
        return jobs;
    });
}
function getNewJobs() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("getting-data");
        console.log(__1.allTimejobs.map((j) => j.title));
        let jobs = yield scrap();
        jobs = jobs === null || jobs === void 0 ? void 0 : jobs.map((x) => {
            const jobTime = x.timeAgo.split(' ');
            let actualTime;
            if (jobTime[0] !== 'yesterday') {
                const value = +jobTime[0];
                if (jobTime[1].startsWith('day')) {
                    actualTime = (0, moment_1.default)(new Date()).subtract(value, 'd');
                }
                else if (jobTime[1].startsWith('hour')) {
                    actualTime = (0, moment_1.default)(new Date()).subtract(value, 'h');
                }
                else if (jobTime[1].startsWith('minute')) {
                    actualTime = (0, moment_1.default)(new Date()).subtract(value, 'm');
                }
                else if (jobTime[1].startsWith('second')) {
                    actualTime = (0, moment_1.default)(new Date()).subtract(value, 's');
                }
            }
            else {
                actualTime = (0, moment_1.default)(new Date()).subtract(1, 'd');
            }
            return Object.assign(Object.assign({}, x), { time: actualTime, timeAgo: actualTime.fromNow() });
        });
        console.log("outside");
        console.log(jobs === null || jobs === void 0 ? void 0 : jobs.map((j) => j.title));
        jobs && (0, __2.update)(__1.allTimejobs.concat(jobs));
        return jobs;
    });
}
exports.default = getNewJobs;
