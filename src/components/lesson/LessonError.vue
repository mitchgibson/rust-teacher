<template>
  <div>
    <Error v-model="model">
      <template #error> Error loading lessons! </template>
      <slot />
    </Error>
  </div>
</template>

<script lang="ts" setup>
import Error from "../primitives/Error.vue";

const model = defineModel<boolean>();
</script>

<style scoped></style>
