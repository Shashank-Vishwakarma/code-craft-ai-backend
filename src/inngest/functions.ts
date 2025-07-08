import { Agent, gemini, openai, createAgent } from "@inngest/agent-kit";

import {inngest} from "./index";

const helloWorld = inngest.createFunction(
    { id: 'hello-world' },
    { event: "test/hello.world" },
    async ({event, step}) => {
        const writer = createAgent({
            name: "Writer",
            system: "You are an expert writer.  You write readable, concise, simple content.",
            model: gemini({ model: "gemini-1.5-flash" })
        });

        const { output } = await writer.run(event.data.value);
        return { output };
    },
);

export const functions = [
    helloWorld
];