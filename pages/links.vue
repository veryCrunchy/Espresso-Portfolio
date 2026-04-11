<script setup lang="ts">
import type { Link, LinksPage } from '~/types/content/links';

const config = useRuntimeConfig();
const directusUrl = config.public.directusUrl;

const { data, pending } = await useAsyncData('links-page', async () => {
  const [cms, links] = await Promise.all([
    $fetch<LinksPage>('/api/links-page'),
    $fetch<Link[]>('/api/links'),
  ]);
  return { cms, links };
});

const cms = computed(() => data.value?.cms);
const links = computed(() => data.value?.links ?? []);

function assetUrl(imageId: string) {
  return `${directusUrl}/assets/${imageId}`;
}
</script>

<template>
  <BlockContainer class="py-10 lg:py-20">
    <!-- Page header -->
    <div class="mb-16 max-w-xl space-y-3">
      <TypographyHeadline as="h1" size="title" :content="cms?.headline ?? ''" />
      <p v-if="cms?.description" class="text-lg leading-8 text-text/95">{{ cms.description }}</p>
    </div>

    <!-- Skeleton -->
    <div v-if="pending" class="flex flex-wrap gap-6">
      <div v-for="i in 4" :key="i" class="h-20 w-20 animate-pulse rounded-2xl bg-primary/10" />
    </div>

    <!-- Link grid -->
    <div v-else-if="links.length" class="flex flex-wrap gap-6">
      <a
        v-for="link in links"
        :key="link.id"
        :href="link.url"
        :target="link.open_new_tab ? '_blank' : undefined"
        :rel="link.open_new_tab ? 'noopener noreferrer' : undefined"
        :title="link.title"
        class="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-primary/8 transition-all duration-200 hover:scale-105 hover:border-primary/40 hover:bg-primary/15 hover:shadow-lg hover:shadow-black/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <!-- Image -->
        <img
          v-if="link.image"
          :src="assetUrl(typeof link.image === 'string' ? link.image : link.image.id)"
          :alt="link.title"
          class="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-110"
          loading="lazy"
          decoding="async"
        />
        <!-- Fallback: first letter -->
        <span
          v-else
          class="text-2xl font-bold text-accent"
          aria-hidden="true"
        >{{ link.title?.[0] ?? '?' }}</span>
      </a>
    </div>

    <p v-else class="text-text/80">Nothing here yet.</p>
  </BlockContainer>
</template>
