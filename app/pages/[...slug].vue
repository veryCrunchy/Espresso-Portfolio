<script lang="ts" setup>
import type { Page } from '#shared/types';

const route = useRoute();
const slug = computed(() => route.path.replace(/\/+$/, '') || '/');

const { data: page, error } = await useCmsFetch<Page>('/api/page', {
  key: computed(() => `page:${slug.value}`),
  query: computed(() => ({ slug: slug.value })),
});

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 500,
    statusMessage: error.value.statusMessage,
    fatal: true,
  });
}

const firstHero = computed(() => page.value?.blocks?.find((b) => b.collection === 'block_hero')?.item as
  | { headline?: string | null; content?: string | null; image?: unknown }
  | undefined);

usePageSeo(() => ({
  title: slug.value === '/' ? null : page.value?.title,
  description: page.value?.seo_description || firstHero.value?.content,
  image: page.value?.seo_image ?? (firstHero.value?.image as string | undefined),
}));

// Per-page color overrides — only inject a style tag when the page has overrides set
useHead(() => {
  const p = page.value;
  const vars = {
    text: p?.color_text,
    background: p?.color_background,
    primary: p?.color_primary,
    secondary: p?.color_secondary,
    accent: p?.color_accent,
  };
  const parts = Object.entries(vars)
    .filter(([, value]) => value)
    .map(([name, value]) => `--color-${name}: ${value};`);
  if (!parts.length) return {};
  return { style: [{ key: 'page-theme', innerHTML: `:root {\n  ${parts.join('\n  ')}\n}` }] };
});
</script>

<template>
  <PageBuilder v-if="page" :page="page" />
</template>
