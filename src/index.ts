import express, { json } from "express";
import getNewJobs, { job } from "./services/jobsService";
import cors from 'cors';
import moment from "moment";
import nodeNotifier from "node-notifier";
import { exec } from "child_process";
import dotenv from 'dotenv'
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// JSON Parser Middleware
app.use(json());
app.use(cors())

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

getNewJobs()
setInterval(async () => {
    try {
        const newJobs = await getNewJobs()
        console.log(newJobs)
        newJobs?.forEach((x: job) => {
            console.log(x)
            const z = nodeNotifier.notify({
                message: x.body,
                title: x.title + ' ' + x.price
            })
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
        })
    } catch (e) {
        console.log(e)
    }
}, 120000);

app.listen(port, () => {
    console.log('Server listening on port: ' + port);
})

export function update(newJobs: job[]) {
    allTimejobs = newJobs
}

