import {Request, Response} from "express";

import { inngest } from "../inngest";
import { MessageSchema } from "../schemas/messages";
import { prisma } from "../db/prisma";

export const createMessage = async (req: Request, res: Response) => {
    const { data, success, error } = MessageSchema.safeParse(req.body);
    if (!success) {
        res.status(400).json({ message: error.message });
        return
    }

    const { projectId } = req.params;
    const project = await prisma.project.findUnique({
        where: {
            id: projectId
        }
    });

    if(!project) {
        res.status(404).json({ message: "Project not found" });
        return
    }

    // save in the db
    await prisma.message.create({
        data: {
            content: data.content,
            role: "USER",
            type: "RESULT",
            projectId,
        }
    })

    // trigger inngest background job
    await inngest.send({
        name: "code-craft-ai-code-generator-agent/run",
        data: {
            value: data.content,
            projectId: project.id
        }
    });

    res.status(201).json({ message: "Message created" });
}