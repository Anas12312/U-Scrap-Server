import express, { json } from "express";
import jobsRouter from "./api/JobsRouter";
import { job } from "./services/jobsService";

const app = express();
const port = process.env.PORT || 3000;

// JSON Parser Middleware
app.use(json());

// Routers Middleware
app.use('/jobs', jobsRouter);


app.listen(port, () => {
    console.log('Server listening on port: ' + port);
})
export function update(newJobs: job[])  {
    allTimejobs = newJobs
}
export let allTimejobs: job[] = []
