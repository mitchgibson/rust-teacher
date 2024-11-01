<template>
  <div class="flex flex-col items-center justify-center h-full grow">
    <Button v-if="!state.begun" @click="fetchLessons">Begin</Button>

    <Async v-if="state.begun" :loading="state.loading">
      <div class="text-xs h-[480px] w-[640px] bg-neutral-800 rounded-2xl flex flex-col p-4 text-neutral-400" @click="next">
        <div class="p-4">
          <div class="text-sm leading-relaxed text-white ">
            {{ rustLesson }}
          </div>
        </div>
        <div class="p-4 bg-neutral-900 m-4 rounded-lg">
          <code class="language-rust" v-html="rustCodeExample"> </code>
        </div>
        <div class="p-4 bg-neutral-900 m-4 rounded-lg">
          <code class="language-typescript" v-html="typescriptCodeExample"></code>
        </div>

        <div class="flex flex-row gap-x-4 w-full p-4">
          <Badge class="cursor-pointer" v-for="category in state.collection[state.index].categorySuggestions" @click="fetchLessons(false, category)">
            {{ category }}
          </Badge>
        </div>
      </div>
    </Async>
  </div>
</template>

<script setup lang="ts">
import { useOpenAI } from "./modules/open-ai";
import Button from "./components/primitives/Button.vue";
import { computed, reactive } from "vue";
import Async from "./components/primitives/Async.vue";
import { lessonCollectionFactory, LessonCollection } from "./domain/lesson/Lesson";
import hljs from "highlight.js";

import typescript from "highlight.js/lib/languages/typescript";
import rust from "highlight.js/lib/languages/rust";
import Badge from "./components/ui/badge/Badge.vue";

hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("rust", rust);

const {start, more, category } = useOpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
    project: import.meta.env.VITE_OPENAI_PROJECT as string,
  });

const state = reactive({
  loading: false,
  begun: false,
  collection: [] as LessonCollection,
  index: 0,
});

async function fetchLessons(continued: boolean = false, scope?: string) {
  state.begun = true;
  

  state.loading = true;

  let func: Function;

  if(scope) {
    func = async () => category(scope);
  }
  else if(continued) {
    func = async () => more(5);
  }
  else {
    func = start;
  }

  const completion = await func();

  console.log(completion);

  console.log(completion.content);
  const json = JSON.parse(completion.content as string);

  const { create } = lessonCollectionFactory();

  state.collection = [...state.collection, ...create(json)];
  state.loading = false;
}

const rustLesson = computed(() => state.collection[state.index].rustLesson);
const rustCodeExample = computed(() => formatRust(state.collection[state.index].rustCodeExample));
const typescriptCodeExample = computed(() => formatTypescript(state.collection[state.index].typescriptCodeExample));

async function next() {
  console.log("next");
  const nextIndex = state.index + 1;
  if (nextIndex === state.collection.length) {
    await fetchLessons(true);
  }
  state.index = nextIndex;
}

function formatRust(code: string) {
  // Preserve line breaks and indentation
  const lines = code.split('\n');
  const formattedLines = lines.map(line => {
    const trimmedLine = line.trimStart();
    const indentation = line.length - trimmedLine.length;
    const highlightedLine = hljs.highlight(trimmedLine, { language: "rust" }).value;
    return `<span class="line-indent" style="padding-left: ${indentation * 0.25}rem;">${highlightedLine}</span>`;
  });

  return formattedLines.join('\n');return hljs.highlight(code, { language: "rust" }).value;
}

function formatTypescript(code: string) {
  const lines = code.split('\n');
  const formattedLines = lines.map(line => {
    const trimmedLine = line.trimStart();
    const indentation = line.length - trimmedLine.length;
    const highlightedLine = hljs.highlight(trimmedLine, { language: "typescript" }).value;
    return `<span class="line-indent" style="padding-left: ${indentation * 0.25}rem;">${highlightedLine}</span>`;
  });

  return formattedLines.join('\n');
}
</script>

<style scoped></style>
