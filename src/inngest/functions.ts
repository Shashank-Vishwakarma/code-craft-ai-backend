import {inngest} from "./index";

const helloWorld = inngest.createFunction(
    { id: 'hello-world' },
    { event: "test/hello.world" },
    async ({event, step}) => {
        await step.sleep("wait-a-moment", "10s");
        return { message: `Hello ${event.data.name}` }
    },
);

export const functions = [
    helloWorld
];