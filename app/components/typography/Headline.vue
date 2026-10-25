<script setup lang="ts">
interface HeadlineProps {
  content: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'title';
}

withDefaults(defineProps<HeadlineProps>(), {
  as: 'h2',
  size: 'md',
});
</script>

<template>
  <component
    :is="as"
    :class="[
      {
        'text-xl': size === 'xs',
        'text-2xl': size === 'sm',
        'text-3xl': size === 'md',
        'text-3xl md:text-4xl': size === 'lg',
        'text-2xl md:text-5xl': size === 'xl',
        'text-4xl sm:text-5xl md:text-7xl': size === 'title',
      },
      'headline text-balance font-semibold leading-tight tracking-tight text-text',
    ]"
    v-html="content"
  />
</template>

<style>
.headline em {
  color: var(--color-primary);
  font-style: normal;
}
</style>
