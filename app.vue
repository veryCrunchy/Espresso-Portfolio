<template>
  <div class="min-h-dvh bg-background text-text">
    <header class="sticky top-0 z-20 border-b border-primary/20 bg-background/90 backdrop-blur-md">
      <nav class="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 lg:px-16">
        <NuxtLink to="/" class="text-sm font-semibold uppercase tracking-[0.35em] text-accent">
          Espresso's Work
        </NuxtLink>

        <div class="flex items-center gap-2 text-sm font-medium text-text/95">
          <NuxtLink
            to="/"
            class="rounded-full border border-transparent px-4 py-2 transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-text"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/testimonials"
            class="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-text transition-colors hover:bg-primary/20"
          >
            Testimonials
          </NuxtLink>
        </div>
      </nav>
    </header>

    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import type { SiteSettings } from '~/types/content/site-settings';

const { data: theme } = await useAsyncData<SiteSettings>(
  'site-settings',
  () => $fetch('/api/site-settings'),
  {
    default: () => ({
      id: 0,
      color_text: 'rgb(255, 204, 129)',
      color_background: 'rgb(19, 12, 9)',
      color_primary: 'rgb(184, 139, 71)',
      color_secondary: 'rgb(110, 90, 61)',
      color_accent: 'rgb(183, 151, 102)',
    }),
  }
);

useHead({
  style: [
    {
      key: 'theme',
      innerHTML: computed(
        () => `:root {
  --color-text: ${theme.value?.color_text};
  --color-background: ${theme.value?.color_background};
  --color-primary: ${theme.value?.color_primary};
  --color-secondary: ${theme.value?.color_secondary};
  --color-accent: ${theme.value?.color_accent};
}`
      ),
    },
  ],
});
</script>

<style>
  body {
    --uno: bg-background color-text;
    margin: 0;
  }

  div {
    font-family: sans-serif;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
</style>
