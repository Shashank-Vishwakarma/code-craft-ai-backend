import { gemini, createAgent, createNetwork } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";

import { Config } from "../config/config";
import {inngest} from "./index";
import { getSandbox } from "../utils/e2b-sandbox";
import { createOrUpdateFile, readFiles, terminalTool } from "./tools";
import { PROMPT } from "../prompts/prompts";
import { getLastAssistantMessage } from "../utils/inngest";

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
        const codeAgent = createAgent({
            name: "code-agent",
            system: PROMPT,
            description: "An expert coding agent",
            model: gemini({ model: "gemini-2.0-flash" }),
            tools: [
                terminalTool(sandboxId),
                createOrUpdateFile(sandboxId),
                readFiles(sandboxId)
            ],
            lifecycle: {
                onResponse: async ({ result, network }) => {
                    const lastAssistentMessage = getLastAssistantMessage(result);

                    if(lastAssistentMessage && network) {
                        if(lastAssistentMessage.includes("<task-summary>")) {
                            network.state.data.summary = lastAssistentMessage;
                        }
                    }

                    return result;
                }
            }
        });

        const network = createNetwork({
            name: "coding-agent-network",
            agents: [codeAgent],
            maxIter: 15,
            router: async ({ network }) => {
                const summary = network.state.data.summary;
                if(summary) {
                    return;
                }
                return codeAgent;
            }
        });

        const result = await network.run(event.data.value);

        // generate sandbox url
        const sanboxUrl = await step.run("get-sandbox-url", async () => {
            const sanbox = await getSandbox(sandboxId);
            const host = sanbox.getHost(3000);
            return `https://${host}`
        })

        return { 
            url: sanboxUrl,
            title: "Fragment",
            files: result.state.data.files,
            summary: result.state.data.summary
        };
    },
);

export const functions = [
    helloWorld
];