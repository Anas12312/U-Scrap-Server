import puppeteer, { Browser } from 'puppeteer';
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
    timeAgo: string,
    type: string
}
async function scrap(search: string, type: string) {
    const browser = await puppeteer.launch({
        headless: false,
        timeout: 300_000,
        // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
    })
    const page = await browser.newPage()
    await page.goto(search)
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
        if (existing.includes("https://www.upwork.com" + link)) continue
        jobs.push({
            title: "" + titleText,
            price: "" + price,
            body: "" + body,
            link: "https://www.upwork.com" + link,
            timeAgo: time!,
            type: type
        })
    }
    await browser.close()
    return jobs
}

async function getNewJobs(search: string, browser: Browser, type: string) {
    console.log("getting-data")
    // console.log(allTimejobs.map((j: any) => j.title))
    let jobs = await scrap(search, type)

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

    jobs && update(allTimejobs.concat(jobs))

    return jobs
}

export default getNewJobs;