import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export type OpenAIConfig = {
  apiKey: string;
  project: string;
};

/*
`I want to learn Rust by comparing it to TypeScript. 
            Give me flash card content that shows code samples of Rust language and its equivalent in TypeScript.
            Provide your response as a json object with this template: [{ rustCodeExample: string, rustLesson: string, typescriptCodeExample: string, categorySuggestions: string[] }]
            Do not provide any content other that the flash card content.
            Provide content in a way that can be parsed with javascript's JSON.parse.
            Use the following categories: fundamentals, syntax, types.
            Provide 5 flash cards, each with only one feature.
            Ensure that response is valid json.
            Include category suggestions related to the content of the flash card. Place them in the categorySuggestions array.
            `
 */
export function useOpenAI(config: OpenAIConfig) {
  const client = new OpenAI({
    apiKey: config.apiKey,
    project: config.project,
    dangerouslyAllowBrowser: true,
  });

  function getPrompt(category?: string) {
    if (category) {
      return `I want to learn Rust by comparing it to TypeScript, focusing on the category: ${category}. 
            Give me flash card content that shows code samples of Rust language and its equivalent in TypeScript.
            Provide your response as a json object with this template: [{ rustCodeExample: string, rustLesson: string, typescriptCodeExample: string, categorySuggestions: string[] }]
            Do not provide any content other than the flash card content.
            Provide content in a way that can be parsed with javascript's JSON.parse.
            Ensure that all examples and lessons are related to the ${category} category.
            Provide 5 flash cards, each with only one feature.
            Ensure that response is valid json.
            Include category suggestions related to the content of the flash card. Place them in the categorySuggestions array.`;
    }
    return `I want to learn Rust by comparing it to TypeScript. 
            Give me flash card content that shows code samples of Rust language and its equivalent in TypeScript.
            Provide your response as a json object with this template: [{ rustCodeExample: string, rustLesson: string, typescriptCodeExample: string, categorySuggestions: string[] }]
            Do not provide any content other than the flash card content.
            Provide content in a way that can be parsed with javascript's JSON.parse.
            Use the following categories: fundamentals, syntax, types.
            Provide 5 flash cards, each with only one feature.
            Ensure that response is valid json.
            Include category suggestions related to the content of the flash card. Place them in the categorySuggestions array.`;
  }

  const conversationHistory: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "You are an AI assistant helping to create flash cards comparing Rust and TypeScript. All responses MUST be in JSON format and use this template: [{ rustCodeExample: string, rustLesson: string, typescriptCodeExample: string, categorySuggestions: string[] }]",
    },
  ];

  async function start(category?: string) {
    conversationHistory.push({
      role: "user",
      content: getPrompt(category),
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: conversationHistory,
    });

    conversationHistory.push(completion.choices[0].message);
    return completion.choices[0].message;
  }

  async function more(n: number) {
    const continueMessage: ChatCompletionMessageParam = {
      role: "user",
      content: `Please provide ${n} more flash cards comparing Rust and TypeScript, focusing on different aspects than before.`,
    };
    conversationHistory.push(continueMessage);

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: conversationHistory,
    });

    conversationHistory.push(completion.choices[0].message);
    return completion.choices[0].message;
  }

  async function category(categoryName: string) {
    return start(categoryName);
  }

  return {
    start,
    more,
    category,
  };
}
