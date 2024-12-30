import express, { json } from "express";
import getNewJobs, { job } from "./services/jobsService";
import cors from 'cors';
import moment from "moment";
import nodeNotifier from "node-notifier";
import { exec } from "child_process";
import puppeteer from "puppeteer";
import dotenv from 'dotenv'
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// JSON Parser Middleware
app.use(json());
app.use(cors())
//asds
// Routers Middleware
app.get('/jobs', (req, res) => {

    const jobs = allTimejobs.map(x => {
        return {
            ...x,
            timeAgo: x.time.fromNow()
        }
    }).sort((left: any, right: any) => {
        return moment.utc(left.timeStamp).diff(moment.utc(right.timeStamp))
    })

    return res.send({
        count: allTimejobs.length,
        jobs
    })
});

export let allTimejobs: job[] = []

puppeteer.launch({
    headless: true,
    timeout: 300_000,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
}).then(async (browser) => {
    await browser.close()
    let firstTime = false;

    async function run() {
        try {
            // if (!firstTime) {
            //     const newJobs = await getNewJobs('https://www.upwork.com/nx/search/jobs/?amount=0-99,100-499,500-999&contractor_tier=1,2&payment_verified=1&proposals=0-4,5-9,10-14&q=javascript&t=0,1',
            //         browser,
            //         'JAVASCRIPT')
            //     firstTime = true;
            //     console.log(newJobs.map(j => j.title))
            //     return
            // }
            const newJobs = await getNewJobs('https://www.upwork.com/nx/search/jobs/?amount=0-99,100-499,500-999&contractor_tier=1,2&payment_verified=1&proposals=0-4,5-9,10-14&q=javascript&t=0,1',
                browser,
                'JAVASCRIPT')
            console.log("js jobs")
            console.log(newJobs)
            newJobs?.forEach((x: job) => {
                // const z = nodeNotifier.notify({
                //     message: x.body,
                //     title: x.title + ' ' + x.price
                // })
                // sendTelegram(x)
            })
        } catch (e) {
            console.log(e)
        }
    }

    run()
    setInterval(() => {
        run()
    }, 30_000);
})



// puppeteer.launch({
//     headless: true,
//     timeout: 300_000,
//     executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
// }).then(async (browser2) => {
//     await browser2.close()
//     let firtsTime2 = false;
//     setInterval(async () => {
//         try {
//             if (!firtsTime2) {
//                 await getNewJobs(
//                     'https://www.upwork.com/nx/search/jobs/?amount=0-99,100-499,500-999&contractor_tier=1,2&payment_verified=1&proposals=0-4,5-9,10-14&q=scrapping&t=0,1',
//                     browser2,
//                     'SCRAPE')
//                 firtsTime2 = true;
//                 return
//             }
//             const newJobs = await getNewJobs('https://www.upwork.com/nx/search/jobs/?amount=0-99,100-499,500-999&contractor_tier=1,2&payment_verified=1&proposals=0-4,5-9,10-14&q=scrapping&t=0,1', browser2, 'SCRAPE')
//             console.log("scrap jobs")
//             console.log(newJobs)
//             newJobs?.forEach((x: job) => {
//                 sendTelegram(x);
//             })
//         } catch (e) {
//             console.log(e)
//         }
//     }, 120_000);
// })


app.listen(port, () => {
    console.log('Server listening on port: ' + port);
})

export function update(newJobs: job[]) {
    allTimejobs = newJobs
}

const sendTelegram = (x: job) => {
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
}


import fs from 'fs'
import path from 'path'

const currentTimeStamp = new Date().getTime()

setInterval(() => {

    const filePath = path.join(__dirname, 'data/' + currentTimeStamp + '-' + new Date().getTime() + '.json');

    fs.writeFileSync(filePath,
        JSON.stringify(allTimejobs)
    )
}, 30 * 60 * 1000)