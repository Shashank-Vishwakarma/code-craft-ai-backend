import express, { Express } from "express";
import cors from "cors";
import CookieParser from "cookie-parser";

import { Config } from "./config/config";
import inngestRouter from "./routes/inngest";
import projectRouter from "./routes/projects";
import messageRouter from "./routes/messages";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(CookieParser());

// use inngest router
app.use(inngestRouter);
app.use(projectRouter);
app.use(messageRouter);

const PORT = Config.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is accessible at ${Config.APP_URL}`);
})