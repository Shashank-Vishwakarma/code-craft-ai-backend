import { Agent, gemini, openai, createAgent } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { Config } from "../config/config";

import {inngest} from "./index";
import { getSandbox } from "../utils/e2b-sandbox";

const helloWorld = inngest.createFunction(
    { id: 'hello-world' },
    { event: "test/hello.world" },
    async ({event, step}) => {
        // get sandbox id
        const sandboxId = await step.run("get-sandbox-id", async () => {
            const sandbox = await Sandbox.create("code-craft-ai-nextjs-test-3", { apiKey: Config.E2B_API_KEY });
            return sandbox.sandboxId;
        })

        // generate file in the sanbox

        // generate sandbox url
        const sanboxUrl = await step.run("get-sandbox-url", async () => {
            const sanbox = await getSandbox(sandboxId);
            const host = sanbox.getHost(3000);
            return `https://${host}`
        })

        return { sanboxUrl };
    },
);

export const functions = [
    helloWorld
];