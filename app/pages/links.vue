<script setup lang="ts">
import type { LinksPage } from '#shared/types';

const [{ data: cms }, { data: links, pending }, { data: page }] = await Promise.all([
  useCmsFetch<LinksPage>('/api/links-page', { key: 'links-page' }),
  useLinks(),
  // Optional CMS page with slug /links: its blocks (e.g. Recent activity) appear below the links.
  useCmsPage('/links'),
]);

usePageTheme(() => mergeDesign(page.value, cms.value));

usePageSeo(() => ({
  title: page.value?.title || 'Links',
  description: page.value?.seo_description || cms.value?.description || cms.value?.headline,
  image: page.value?.seo_image,
}));
</script>

<template>
  <div>
    <BlockContainer class="py-8 lg:py-12">
      <div class="mb-10 max-w-xl space-y-3">
        <TypographyHeadline as="h1" size="title" :content="cms?.headline ?? 'Links'" />
        <p v-if="cms?.description" class="text-lg leading-8 text-text/90">{{ cms.description }}</p>
      </div>

      <div v-if="pending && !links?.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="h-20 animate-pulse rounded-2xl bg-primary/10" />
      </div>
      <LinkGrid v-else-if="links?.length" :links="links" />
      <p v-else class="text-text/80">Nothing here yet.</p>
    </BlockContainer>

    <PageBuilder v-if="page?.blocks?.length" :page="page" />
  </div>
</template>
