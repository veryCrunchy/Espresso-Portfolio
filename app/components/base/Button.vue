<script setup lang="ts">
interface Props {
  as?: string;
}

withDefaults(defineProps<Props>(), {
  as: 'button',
});
</script>

<template>
  <component
    :is="as"
    :type="as === 'button' ? 'button' : undefined"
    class="inline-flex items-center justify-center bg-primary/80 text-sm font-medium text-text transition hover:bg-primary disabled:pointer-events-none disabled:opacity-50"
  >
    <slot />
  </component>
</template>
