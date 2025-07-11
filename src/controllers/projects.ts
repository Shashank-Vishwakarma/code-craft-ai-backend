import {Request, Response} from "express";

import { inngest } from "../inngest";
import { ProjectSchema } from "../schemas/projects";
import { prisma } from "../db/prisma";
import { generateSlug } from "random-word-slugs";

export const createProject = async (req: Request, res: Response) => {
    // get the message from the request body
    const { data, success, error } = ProjectSchema.safeParse(req.body);
    if (!success) {
        res.status(400).json({ message: error.message });
        return
    }

    // create a project in db
    const project = await prisma.project.create({
        data: {
            name: generateSlug(2, {format: "kebab"}),
            messages: {
                create: {
                    content: data.content,
                    role: "USER",
                    type: "RESULT",
                }
            }
        }
    });

    // trigger inngest background job
    await inngest.send({
        name: "code-craft-ai-code-generator-agent/run",
        data: {
            value: data.content,
            projectId: project.id
        }
    });

    res.status(201).json({ message: "Project created" });
}