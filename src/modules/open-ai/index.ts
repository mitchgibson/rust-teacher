import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export type OpenAIConfig = {
    apiKey: string;
    project: string;
};

export function useOpenAI(config: OpenAIConfig) {
    const client = new OpenAI({
        apiKey: config.apiKey,
        project: config.project,
        dangerouslyAllowBrowser: true,
    });

    async function completion(messages: ChatCompletionMessageParam[]) {
        const completion = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
        });

        return completion.choices[0].message;
    }

    return {
        completion,
    };
}