import puppeteer from 'puppeteer';
import { Request, Response } from 'express';
import { allTimejobs } from '..'
import { update } from '..'
import moment from 'moment';
import dotenv from 'dotenv'
dotenv.config();

export interface job {
    title: string
    body: string
    link: string
    price: string
    time?: any
    timeAgo: string
}
async function scrap() {
    const browser = await puppeteer.launch({
        headless: false,
        timeout: 300_000,
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
        ],
        executablePath:
            process.env.NODE_ENV === "production"
                ? process.env.PUPPETEER_EXECUTABLE_PATH
                : puppeteer.executablePath(),
    })

    const page = await browser.newPage()
    await page.goto('https://www.upwork.com/nx/search/jobs/?amount=0-99,100-499,500-999&contractor_tier=1,2&payment_verified=1&proposals=0-4,5-9,10-14&q=javascript&t=1')
    // await page.waitForNetworkIdle()
    const articles = await page.$$('article')
    const jobs: job[] = []
    for (let article of articles) {
        const title = await article.$(".job-tile .up-n-link")
        const titleText = await title?.evaluate((t) => {
            return t.textContent
        })
        const link = await title?.evaluate((t) => {
            return t.getAttribute('href')
        })
        const listElement = await article.$(".job-tile-info-list")
        const itemElement = (await listElement?.$$("li"))?.at(2)
        const strongElement = (await itemElement?.$$("strong"))?.at(1)
        const price = await strongElement?.evaluate((s) => {
            return s.textContent
        })
        const bodyElement = await article.$("p")
        const body = await bodyElement?.evaluate((b) => {
            return b.textContent
        })
        const headerElement = await article.$(".job-tile-header")
        const spanElement = (await headerElement?.$$("span"))?.at(1)
        const time = await spanElement?.evaluate((s) => {
            return s.textContent
        })
        // console.log("--------------------------------")
        // console.log(titleText)
        // console.log(link)
        // console.log(price)
        // console.log(body)
        // console.log(time)
        const existing = allTimejobs.map((j: any) => j.link)
        if (existing.includes("https://www.upwork.com" + link)) return
        jobs.push({
            title: "" + titleText,
            price: "" + price,
            body: "" + body,
            link: "https://www.upwork.com" + link,
            timeAgo: time!
        })
    }
    await browser.close()
    return jobs
}

async function getNewJobs() {
    console.log("getting-data")
    console.log(allTimejobs.map((j: any) => j.title))
    let jobs = await scrap()

    jobs = jobs?.map((x: job) => {
        const jobTime = x.timeAgo.split(' ');
        let actualTime;

        if (jobTime[0] !== 'yesterday') {
            const value = +jobTime[0];

            if (jobTime[1].startsWith('day')) {
                actualTime = moment(new Date()).subtract(value, 'd');
            }
            else if (jobTime[1].startsWith('hour')) {
                actualTime = moment(new Date()).subtract(value, 'h');
            }
            else if (jobTime[1].startsWith('minute')) {
                actualTime = moment(new Date()).subtract(value, 'm');
            }
            else if (jobTime[1].startsWith('second')) {
                actualTime = moment(new Date()).subtract(value, 's');
            }
        }
        else {
            actualTime = moment(new Date()).subtract(1, 'd');
        }

        return {
            ...x,
            time: actualTime,
            timeAgo: actualTime!.fromNow()
        }
    })

    console.log("outside")
    console.log(jobs?.map((j: any) => j.title))
    jobs && update(allTimejobs.concat(jobs))

    return jobs
}

export default getNewJobs;