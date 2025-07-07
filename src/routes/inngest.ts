import { Router } from "express";
import { serve } from "inngest/express";

import { inngest } from "../inngest";
import { functions } from "../inngest/functions";

const inngestRouter = Router();

inngestRouter.use('/api/inngest', serve({ client: inngest, functions }));

export default inngestRouter;