import puppeteer from 'puppeteer';
import { Request, Response } from 'express';
import {allTimejobs} from '..'
import {update} from '..'
export interface job  {
    title: string
    body: string
    link: string
    price: string
    time: string
}
async function scrap() {
    const browser = await puppeteer.launch({
        headless: false, 
    });
    const page = await browser.newPage()
    await page.goto('https://www.upwork.com/nx/search/jobs/?amount=0-99,100-499,500-999&contractor_tier=1,2&payment_verified=1&proposals=0-4,5-9,10-14&q=javascript&t=1')
    // const jobTile = ".job-tile .up-n-link"
    // const evaluated = await page.waitForSelector(jobTile)
    // const link = await evaluated?.evaluate(el => el.getAttribute("href"))
    // return link
    
    
    const jobs = await page.evaluate((allTimejobs) => {
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
        const existing = allTimejobs.map(j => j.link)
        const data: job[] = [] 
        titles.forEach((_, index) => {
            if(existing.includes("https://www.upwork.com" + linkes[index])) return
            data.push({
                title: "" + titles[index],
                price: "" + prices[index],
                body: "" + bodies[index],
                link: "https://www.upwork.com" + linkes[index],
                time: "" + times[index]
            })
        })
        return data
    }, allTimejobs)
    // console.log(jobs)
    browser.close()
    return jobs
}

async function getNewJobs(req: Request, res: Response) {
    console.log("getting-data")
    console.log(allTimejobs.map(j => j.title))
    const jobs = await scrap()
    console.log("outside")
    console.log(jobs.map(j => j.title))
    update(allTimejobs.concat(jobs))
    res.send({
        count: allTimejobs.length,
        jobs: allTimejobs
    }) 
}

export default getNewJobs;