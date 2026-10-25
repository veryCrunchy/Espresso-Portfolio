<script setup lang="ts">
import type { LinksPage } from '#shared/types';

const [{ data: cms }, { data: links, pending }] = await Promise.all([
  useCmsFetch<LinksPage>('/api/links-page', { key: 'links-page' }),
  useLinks(),
]);

usePageSeo(() => ({
  title: 'Links',
  description: cms.value?.description || cms.value?.headline,
}));
</script>

<template>
  <BlockContainer class="py-10 lg:py-20">
    <div class="mb-12 max-w-xl space-y-3">
      <TypographyHeadline as="h1" size="title" :content="cms?.headline ?? 'Links'" />
      <p v-if="cms?.description" class="text-lg leading-8 text-text/90">{{ cms.description }}</p>
    </div>

    <div v-if="pending && !links?.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i" class="h-20 animate-pulse rounded-2xl bg-primary/10" />
    </div>
    <LinkGrid v-else-if="links?.length" :links="links" />
    <p v-else class="text-text/80">Nothing here yet.</p>
  </BlockContainer>
</template>
