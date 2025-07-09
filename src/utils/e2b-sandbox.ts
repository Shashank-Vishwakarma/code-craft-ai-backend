import { Sandbox } from "@e2b/code-interpreter";

export const getSandbox = async (sandboxId: string) => {
    const sanbox = await Sandbox.connect(sandboxId);
    return sanbox;
}