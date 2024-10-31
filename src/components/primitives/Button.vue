<template>
  <Button
    class="bg-transparent hover:bg-transparent border-2 border-neutral-500 hover:border-neutral-400 text-neutral-500 hover:text-neutral-400 rounded px-5 py-2"
  >
    <slot />
  </Button>
</template>

<script lang="ts" setup>
import Button from '../ui/button/Button.vue';

</script>

<style scoped></style>
