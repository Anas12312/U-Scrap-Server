import puppeteer from 'puppeteer';
import { Request, Response } from 'express';
import { allTimejobs } from '..'
import { update } from '..'
import moment from 'moment';
export interface job {
    title: string
    body: string
    link: string
    price: string
    time?: any,
    timeAgo: string
}
async function scrap() {
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage()
    await page.goto('https://www.upwork.com/nx/search/jobs/?amount=0-99,100-499,500-999&contractor_tier=1,2&payment_verified=1&proposals=0-4,5-9,10-14&q=javascript&t=1')

    const jobs = await page.evaluate((allTimejobs: any) => {
        const linkes = Array.from(document.querySelectorAll(".job-tile .up-n-link")).map(
            (element) => element.getAttribute('href')
        )
        const titles = Array.from(document.querySelectorAll(".job-tile .up-n-link")).map(
            (element) => element.textContent
        );
        const prices = Array.from(document.querySelectorAll("[data-test='is-fixed-price']")).map(
            (element) => element.textContent
        );
        const bodies = Array.from(document.querySelectorAll("[data-test='UpCLineClamp JobDescription']")).map(
            (element) => element.textContent
        );
        const times = Array.from(document.querySelectorAll("[data-test='job-pubilshed-date']> span:nth-child(2)")).map(
            (element) => element.textContent
        );
        const existing = allTimejobs.map((j: any) => j.link)
        const data: job[] = []
        titles.forEach((_, index) => {
            if (existing.includes("https://www.upwork.com" + linkes[index])) return
            data.push({
                title: "" + titles[index],
                price: "" + prices[index],
                body: "" + bodies[index],
                link: "https://www.upwork.com" + linkes[index],
                timeAgo: times[index]!
            })
        })
        return data
    }, allTimejobs)

    browser.close()
    return jobs
}

async function getNewJobs() {
    console.log("getting-data")
    console.log(allTimejobs.map((j: any) => j.title))
    let jobs = await scrap()

    jobs = jobs.map((x: job) => {
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
    console.log(jobs.map((j: any) => j.title))
    update(allTimejobs.concat(jobs))
}

export default getNewJobs;