<template>
  <div>
    <slot v-if="model" name="error" />
    <slot v-else />
  </div>
</template>

<script lang="ts" setup>

const model = defineModel<boolean>();
</script>
