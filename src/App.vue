<template>
  <div class="flex flex-col items-center justify-center h-full grow text-neutral-300">
    <Button v-if="!state.begun" @click="fetchLessons">Begin</Button>

    <Async v-if="state.begun" :loading="state.loading">
      <LessonError v-model="state.error">
        <div
          class="text-xs h-[600px] max-h-[600px] w-[640px] bg-neutral-800 rounded-2xl flex flex-col p-4 text-neutral-400"
          @click="next"
          @contextmenu.prevent="previous"
        >
          <div class="flex flex-row grow overflow-y-auto">
            <div class="flex flex-col w-full">
              <div class="p-4">
                <div class="text-base leading-relaxed text-white">
                  {{ rustLesson }}
                </div>
              </div>
              <div v-html="rustCodeExample"></div>
              <div v-html="typescriptCodeExample"></div>
            </div>
          </div>

          <div class="flex flex-row items-center justify-end p-4">
            <div class="flex flex-row flex-wrap gap-x-4 w-full p-4">
              <Badge
                class="cursor-pointer py-1 px-4"
                v-for="category in state.collection[state.index].categorySuggestions"
                @click="fetchLessons(false, category)"
              >
                {{ category }}
              </Badge>
            </div>
            <div class="text-sm">{{ state.index + 1 }}/{{ state.collection.length }}</div>
          </div>
        </div>
      </LessonError>
    </Async>
  </div>
</template>

<script setup lang="ts">
// TODO: Refactor into component set (LessonCard, LessonCardCollection)
// TODO: Create specific error state component
// IDEA: Tree structure based on categories so you can navigate between sets of related cards
import { useOpenAI } from "./modules/open-ai";
import Button from "./components/primitives/Button.vue";
import { computed, reactive } from "vue";
import Async from "./components/primitives/Async.vue";
import { lessonCollectionFactory, LessonCollection } from "./domain/lesson/Lesson";
import hljs from "highlight.js";

import typescript from "highlight.js/lib/languages/typescript";
import rust from "highlight.js/lib/languages/rust";
import Badge from "./components/ui/badge/Badge.vue";
import LessonError from "./components/lesson/LessonError.vue";

hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("rust", rust);

const { start, more, category } = useOpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
  project: import.meta.env.VITE_OPENAI_PROJECT as string,
});

const state = reactive({
  loading: false,
  begun: false,
  error: false,
  collection: [] as LessonCollection,
  index: 0,
});

async function fetchLessons(continued: boolean = false, scope?: string) {
  try {
    state.begun = true;

    state.loading = true;

    let func: Function;

    if (scope) {
      func = async () => category(scope);
    } else if (continued) {
      func = async () => more(5);
    } else {
      func = start;
    }
    const completion = await func();
    const json = JSON.parse(completion.content as string);

    const { create } = lessonCollectionFactory();

    state.collection = [...state.collection, ...create(json)];
  } catch (e) {
    state.error = true;
  } finally {
    state.loading = false;
  }
}

const rustLesson = computed(() => state.collection[state.index].rustLesson);
const rustCodeExample = computed(() => formatRust(state.collection[state.index].rustCodeExample));
const typescriptCodeExample = computed(() => formatTypescript(state.collection[state.index].typescriptCodeExample));

async function next() {
  const nextIndex = state.index + 1;
  if (nextIndex === state.collection.length) {
    await fetchLessons(true);
  }
  state.index = nextIndex;
}

function previous() {
  state.index = Math.max(0, state.index - 1);
}

function formatCode(code: string, language: string) {
  const highlightedCode = hljs.highlight(code, { language }).value;
  return `<pre class="p-4 bg-neutral-900 overflow-x-auto m-4 rounded-lg text-sm"><code class="language-${language}">${highlightedCode}</code></pre>`;
}

function formatRust(code: string) {
  return formatCode(code, "rust");
}

function formatTypescript(code: string) {
  return formatCode(code, "typescript");
}
</script>

<style scoped>
pre {
  white-space: pre;
  word-wrap: normal;
  overflow-x: auto;
}

code {
  display: block;
  padding: 1em;
  overflow-x: auto;
}
</style>
