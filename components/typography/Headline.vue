<script setup lang="ts">
  interface HeadlineProps {
    content: string;
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "title";
  }

  withDefaults(defineProps<HeadlineProps>(), {
    as: "h2",
    size: "md",
  });
</script>
<template>
  <div
    :class="[
      {
        'text-xl': size === 'xs',
        'text-2xl': size === 'sm',
        'text-3xl': size === 'md',
        'text-4xl': size === 'lg',
        'text-2xl md:text-5xl': size === 'xl',
        'text-4xl xs:text-5xl md:text-7xl  dark:drop-shadow': size === 'title',
      },
      ' font-semibold leading-snug tracking-tight color-em text-text',
    ]"
    v-html="content"
  />
</template>

<style>
  .color-em {
    em {
      @apply text-primary not-italic;
    }
  }
</style>
