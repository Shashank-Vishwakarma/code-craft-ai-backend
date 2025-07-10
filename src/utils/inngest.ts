import { AgentResult, TextMessage } from "@inngest/agent-kit";

export const getLastAssistantMessage = (result: AgentResult)=>{
    const assistantMessages = result.output.filter((message) => message.role === "assistant");
    const lastMessage = assistantMessages[assistantMessages.length - 1]  as | TextMessage | undefined;

    if(lastMessage?.content) {
        if(typeof lastMessage.content === "string") {
            return lastMessage.content;
        } else if(typeof lastMessage.content === "object") {
            return lastMessage?.content?.map((m) => m.text).join("\n");
        }
    } else {
        return undefined;
    }
}