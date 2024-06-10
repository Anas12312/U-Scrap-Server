import { Router } from "express";
import jobsService from "../services/jobsService";

const testRouter = Router();

testRouter.get('/', jobsService);


export default testRouter;