<template>
  <div class="flex flex-col items-center justify-center h-full grow">
    <Button v-if="!state.begun" @click="handleClick">Begin</Button>

    <div v-if="state.loading" class="text-xl text-white">Loading...</div>
    
    <div v-if="!state.loading && state.begun" class="text-white text-xs overflow-auto">
      {{ state.content }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOpenAI } from "./modules/open-ai";
import Button from "./components/primitives/Button.vue";
import { reactive } from "vue";

const state = reactive({
  loading: false,
  begun: false,
  content: ""
});

function handleClick() {
  const ai = useOpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
    project: import.meta.env.VITE_OPENAI_PROJECT as string,
  });

  async function chat() {
    state.loading = true;
    const completion = await ai.completion([
      {
        role: "user",
        content: `I want to learn Rust by comparing it to TypeScript. 
        Give me flash card content that shows code samples of Rust language and its equivalent in TypeScript.
        Provide your response as a json object with this template: [{ rustCodeExample: string, rustLesson: string, typescriptCodeExample: string, categorySuggestions: string[] }]
        Do not provide any content other that the flash card content.
        Provide content in a way that can be parsed with javascript's JSON.parse.
        Use the following categories: fundamentals, syntax, types.
        Provide 5 flash cards, each with only one feature.
        `,
      },
    ]);

    console.log(completion);

    console.log(completion.content);
    const json = JSON.parse(completion.content as string);

    state.content = json;
    state.loading = false;
    state.begun = true;
  }

  chat();
}
</script>

<style scoped></style>