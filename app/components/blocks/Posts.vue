<script setup lang="ts">
import { setAttr } from '@directus/visual-editing';
import type { BlockPosts, PostList } from '#shared/types';

const props = defineProps<{
  data: BlockPosts;
  priority?: boolean;
}>();

const limit = computed(() => Math.min(Math.max(props.data.limit ?? 3, 1), 12));

const { data: list } = await useCmsFetch<PostList>('/api/posts', {
  key: computed(() => `posts-block:${limit.value}`),
  query: computed(() => ({ limit: limit.value })),
});
</script>

<template>
  <BlockContainer
    v-if="list?.posts.length"
    :data-directus="setAttr({ collection: 'block_posts', item: data.id ?? null, fields: 'title,headline,limit', mode: 'drawer' })"
  >
    <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <TypographyTitle v-if="data.title">{{ data.title }}</TypographyTitle>
        <TypographyHeadline :content="data.headline || 'From the blog'" size="lg" />
      </div>
      <NuxtLink
        to="/blog"
        class="inline-flex items-center gap-2 rounded-full border border-primary/30 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-primary/15"
      >
        All posts <Icon name="material-symbols:arrow-forward-rounded" class="size-4" />
      </NuxtLink>
    </div>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <PostCard v-for="post in list.posts" :key="post.id" :post="post" />
    </div>
  </BlockContainer>
</template>
