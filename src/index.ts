import express, { json } from "express";
import jobsRouter from "./api/JobsRouter";
import getNewJobs, { job } from "./services/jobsService";
import cors from 'cors';
import moment from "moment";

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
setInterval(() => {
    try {
        getNewJobs()
    } catch(e) {
        console.log(e)
    }
}, 120000);

app.listen(port, () => {
    console.log('Server listening on port: ' + port);
})

export function update(newJobs: job[]) {
    allTimejobs = newJobs
}

