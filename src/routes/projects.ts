import { Router } from "express";

import { createProject } from "../controllers/projects";

const router = Router();

router.post("/projects", createProject);

export default router;