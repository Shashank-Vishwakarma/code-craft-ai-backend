import {z} from "zod";

export const ProjectSchema = z.object({
    content: z.string()
        .min(1, { message: "Message is required" })
        .max(1000, { message: "Message is too long" }),
})