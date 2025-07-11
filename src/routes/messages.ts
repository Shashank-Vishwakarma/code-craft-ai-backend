import { Router } from "express";

import { createMessage } from "../controllers/messages";

const router = Router();

router.post("/projects/:projectId/messages", createMessage);

export default router;