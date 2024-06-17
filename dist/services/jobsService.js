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
        const browser = yield puppeteer_1.default.launch({
            headless: false,
        });
        const page = yield browser.newPage();
        yield page.goto('https://www.upwork.com/nx/search/jobs/?amount=0-99,100-499,500-999&contractor_tier=1,2&payment_verified=1&proposals=0-4,5-9,10-14&q=javascript&t=1');
        const jobs = yield page.evaluate((allTimejobs) => {
            const linkes = Array.from(document.querySelectorAll(".job-tile .up-n-link")).map((element) => element.getAttribute('href'));
            const titles = Array.from(document.querySelectorAll(".job-tile .up-n-link")).map((element) => element.textContent);
            const prices = Array.from(document.querySelectorAll("[data-test='is-fixed-price']")).map((element) => element.textContent);
            const bodies = Array.from(document.querySelectorAll("[data-test='UpCLineClamp JobDescription']")).map((element) => element.textContent);
            const times = Array.from(document.querySelectorAll("[data-test='job-pubilshed-date']> span:nth-child(2)")).map((element) => element.textContent);
            const existing = allTimejobs.map((j) => j.link);
            const data = [];
            titles.forEach((_, index) => {
                if (existing.includes("https://www.upwork.com" + linkes[index]))
                    return;
                data.push({
                    title: "" + titles[index],
                    price: "" + prices[index],
                    body: "" + bodies[index],
                    link: "https://www.upwork.com" + linkes[index],
                    timeAgo: times[index]
                });
            });
            return data;
        }, __1.allTimejobs);
        browser.close();
        return jobs;
    });
}
function getNewJobs() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("getting-data");
        console.log(__1.allTimejobs.map((j) => j.title));
        let jobs = yield scrap();
        jobs = jobs.map((x) => {
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
        console.log(jobs.map((j) => j.title));
        (0, __2.update)(__1.allTimejobs.concat(jobs));
        return jobs;
    });
}
exports.default = getNewJobs;
