import { gemini, createAgent, createNetwork } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";

import { Config } from "../config/config";
import {inngest} from "./index";
import { getSandbox } from "../utils/e2b-sandbox";
import { createOrUpdateFile, readFiles, terminalTool } from "./tools";
import { PROMPT } from "../prompts/prompts";
import { getLastAssistantMessage } from "../utils/inngest";
import { prisma } from "../db/prisma";

export interface AgentState {
    summary: string,
    files: {
        [path: string]: string
    }
};

const codeGeneratorAgentFunction = inngest.createFunction(
    { id: 'code-craft-ai-code-generator-agent' },
    { event: "code-craft-ai-code-generator-agent/run" },
    async ({event, step}) => {
        // get sandbox id
        const sandboxId = await step.run("get-sandbox-id", async () => {
            const sandbox = await Sandbox.create("code-craft-ai-nextjs-test-3", { apiKey: Config.E2B_API_KEY });
            return sandbox.sandboxId;
        });

        // generate file in the sanbox
        const codeAgent = createAgent<AgentState>({
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

        const network = createNetwork<AgentState>({
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

        console.log("result", result.state.data);

        const isError = !result.state.data.summary || Object.keys(result.state.data.files).length === 0;

        // save the data in the db
        await step.run("save-result-in-db", async () => {
            if(isError) {
                await prisma.message.create({
                    data: {
                        content: "Something went wrong. Please try again.",
                        role: "ASSISTANT",
                        type: "ERROR",
                        projectId: event.data.projectId
                    }
                });

                return
            }

            await prisma.message.create({
                data: {
                    content: result.state.data.summary,
                    role: "ASSISTANT",
                    type: "RESULT",
                    projectId: event.data.projectId,
                    fragment: {
                        create: {
                            sandboxUrl: sanboxUrl,
                            files: result.state.data.files,
                            title: "Fragment"
                        }
                    }
                }
            });
        });

        return { 
            url: sanboxUrl,
            title: "Fragment",
            files: result.state.data.files,
            summary: result.state.data.summary
        };
    },
);

export const functions = [
    codeGeneratorAgentFunction
];