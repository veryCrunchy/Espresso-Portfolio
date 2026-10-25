<script setup lang="ts">
import type { BlogPage, PostList } from '#shared/types';

const route = useRoute();
const tag = computed(() => (typeof route.query.tag === 'string' ? route.query.tag : undefined));
const page = computed(() => Math.max(Number(route.query.page) || 1, 1));

const { data: cms } = await useCmsFetch<BlogPage>('/api/blog-page', { key: 'blog-page' });

const { data: list, pending } = await useCmsFetch<PostList>('/api/posts', {
  key: computed(() => `posts:${tag.value ?? ''}:${page.value}`),
  query: computed(() => ({ tag: tag.value, page: page.value, limit: cms.value?.posts_per_page ?? 9 })),
});

if (list.value && page.value > list.value.pageCount) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

usePageSeo(() => ({
  title: tag.value ? `Posts tagged “${tag.value}”` : 'Blog',
  description: cms.value?.description,
  // Tag / paginated listings are thin duplicates of the main index.
  noindex: !!tag.value || page.value > 1,
}));

function pageLink(n: number) {
  return { path: '/blog', query: { ...(tag.value ? { tag: tag.value } : {}), ...(n > 1 ? { page: n } : {}) } };
}
</script>

<template>
  <BlockContainer class="py-10 lg:py-20">
    <header class="mb-10 max-w-2xl space-y-4">
      <TypographyTitle v-if="cms?.eyebrow" as="p">{{ cms.eyebrow }}</TypographyTitle>
      <TypographyHeadline as="h1" size="title" :content="cms?.headline || 'Blog'" />
      <p v-if="cms?.description" class="text-lg leading-8 text-text/90">{{ cms.description }}</p>
    </header>

    <nav v-if="list?.tags.length" class="mb-10 flex flex-wrap gap-2" aria-label="Filter by tag">
      <NuxtLink
        to="/blog"
        :class="['tag', !tag && 'tag-active']"
      >All</NuxtLink>
      <NuxtLink
        v-for="t in list.tags"
        :key="t"
        :to="{ path: '/blog', query: { tag: t } }"
        :class="['tag', tag === t && 'tag-active']"
      >#{{ t }}</NuxtLink>
    </nav>

    <div v-if="pending && !list?.posts.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 3" :key="i" class="h-80 animate-pulse rounded-2xl bg-primary/10" />
    </div>

    <div v-else-if="list?.posts.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <PostCard
        v-for="(post, i) in list.posts"
        :key="post.id"
        :post="post"
        :featured="i === 0 && page === 1 && !tag"
      />
    </div>

    <div v-else class="rounded-2xl border border-dashed border-primary/25 px-6 py-16 text-center text-text/75">
      <Icon name="material-symbols:edit-note-rounded" class="mb-3 size-10 text-accent" />
      <p>{{ tag ? `Nothing tagged #${tag} yet.` : 'The first post is still brewing. Check back soon.' }}</p>
    </div>

    <nav v-if="list && list.pageCount > 1" class="mt-12 flex items-center justify-between gap-4" aria-label="Pagination">
      <NuxtLink v-if="page > 1" :to="pageLink(page - 1)" class="pager" rel="prev">
        <Icon name="material-symbols:arrow-back-rounded" class="size-5" /> Newer
      </NuxtLink>
      <span v-else />
      <span class="text-sm text-text/60">Page {{ page }} of {{ list.pageCount }}</span>
      <NuxtLink v-if="page < list.pageCount" :to="pageLink(page + 1)" class="pager" rel="next">
        Older <Icon name="material-symbols:arrow-forward-rounded" class="size-5" />
      </NuxtLink>
      <span v-else />
    </nav>
  </BlockContainer>
</template>

<style scoped>
.tag {
  --uno: rounded-full border border-primary/25 px-4 py-1.5 text-sm text-text/80 transition-colors hover:border-primary/50 hover:bg-primary/15;
}
.tag-active {
  --uno: border-accent/60 bg-accent/15 text-accent;
}
.pager {
  --uno: inline-flex items-center gap-2 rounded-full border border-primary/25 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-primary/15;
}
</style>
