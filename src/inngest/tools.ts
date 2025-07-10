import { createTool } from "@inngest/agent-kit";
import z from "zod";
import { getSandbox } from "../utils/e2b-sandbox";

export const terminalTool = (sandboxId: string) => {
    return createTool({
        name: "terminal",
        description: "Use the terminal to run commands",
        parameters: z.object({
            command: z.string()
        }),
        handler: async ({ command }, { step }) => {
            return step?.run("run-command", async () => {
                const buffers = {
                    stdout: "",
                    stderr: ""
                };

                // run this command in the sandbox
                try {
                    const sanbox = await getSandbox(sandboxId);
                    const result = await sanbox.commands.run(command, {
                        onStdout: (data) => {
                            buffers.stdout += data;
                        },
                        onStderr: (data) => {
                            buffers.stderr += data;
                        }
                    });
                    return result.stdout;
                } catch(err: any) {
                    console.log(`Error running command: ${err}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`);
                    return `Error running command: ${err}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
                }
            })
        }
    })
}

export const createOrUpdateFile = (sandboxId: string) => {
    return createTool({
        name: "createOrUpdateFiles",
        description: "Create or update a file",
        parameters: z.object({
            files: z.array(
                z.object({
                    path: z.string(),
                    content: z.string()
                })
            )
        }),
        handler: async ({ files }, { step, network }) => {
            const newFiles = step?.run("createOrUpdateFile", async () => {
                try {
                    const updatedFiles = network.state.data.files || {};
                    const sanbox = await getSandbox(sandboxId);
                    for(const file of files) {
                        await sanbox.files.write(file.path, file.content);
                        updatedFiles[file.path] = file.content;
                    }
                    return updatedFiles;
                } catch(err: any) {
                    console.log(`Error: ${err}`);
                    return `Error: ${err}`;
                }
            });

            if(typeof newFiles === "object") {
                network.state.data.files = newFiles;
            }
        }
    })
}

export const readFiles = (sandboxId: string) => {
    return createTool({
        name: "readFiles",
        description: "Read files",
        parameters: z.object({
            files: z.array(z.string())
        }),
        handler: async ({ files }, { step }) => {
            return step?.run("readFiles", async () => {
                try {
                    const sanbox = await getSandbox(sandboxId);
                    const contents = [];
                    for(const file of files) {
                        const content = await sanbox.files.read(file);
                        contents.push({path: file, content});
                    }
                    return JSON.stringify(contents || []);
                } catch(err: any) {
                    console.log(`Error: ${err}`);
                    return `Error: ${err}`;
                }
            })
        }
    })
}