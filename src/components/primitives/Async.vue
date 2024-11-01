<template>
  <div>
    <Loader v-if="props.loading" />
    <slot v-else />
  </div>
</template>

<script lang="ts" setup>
import Loader from "./Loader.vue";

const props = withDefaults(
  defineProps<{
    loading: boolean;
  }>(),
  {}
);
</script>
