<script setup lang="ts">
import type { BlogPage, PostList } from '#shared/types';

const route = useRoute();
const tag = computed(() => (typeof route.query.tag === 'string' ? route.query.tag : undefined));
const page = computed(() => Math.max(Number(route.query.page) || 1, 1));

const [{ data: cms }, { data: blogPage }] = await Promise.all([
  useCmsFetch<BlogPage>('/api/blog-page', { key: 'blog-page' }),
  useCmsPage('/blog'),
]);

// One cache entry for the list: switching tabs keeps the current posts on screen
// (dimmed) until the next set arrives, instead of flashing a skeleton.
const { data: list, pending } = await useCmsFetch<PostList>('/api/posts', {
  key: 'blog-posts',
  query: computed(() => ({ tag: tag.value, page: page.value, limit: cms.value?.posts_per_page ?? 9 })),
});

if (list.value && page.value > list.value.pageCount) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

usePageTheme(blogPage);

usePageSeo(() => ({
  title: tag.value ? `Posts tagged “${tag.value}”` : blogPage.value?.title || 'Blog',
  description: blogPage.value?.seo_description || cms.value?.description,
  image: blogPage.value?.seo_image,
  // Tag / paginated listings are thin duplicates of the main index.
  noindex: !!tag.value || page.value > 1,
}));

const tabs = computed(() => [
  { key: '', label: 'All', count: list.value?.totalAll, to: { path: '/blog' } },
  ...(list.value?.tags ?? []).map((t) => ({
    key: t,
    label: `#${t}`,
    count: list.value?.tagCounts[t],
    to: { path: '/blog', query: { tag: t } },
  })),
]);
const activeTab = ref(tag.value ?? '');
watch(tag, (t) => (activeTab.value = t ?? ''));

function pageLink(n: number) {
  return { path: '/blog', query: { ...(tag.value ? { tag: tag.value } : {}), ...(n > 1 ? { page: n } : {}) } };
}
</script>

<template>
  <div>
    <BlockContainer class="pb-0 lg:pb-0">
      <header class="max-w-2xl space-y-3">
        <TypographyTitle v-if="cms?.eyebrow" as="p">{{ cms.eyebrow }}</TypographyTitle>
        <TypographyHeadline as="h1" size="xl" :content="cms?.headline || 'Blog'" />
        <p v-if="cms?.description" class="text-lg leading-8 text-text/90">{{ cms.description }}</p>
      </header>
    </BlockContainer>

    <!-- Optional blocks from the CMS page with slug /blog -->
    <PageBuilder v-if="blogPage?.blocks?.length" :page="blogPage" />

    <BlockContainer>
      <TabBar v-if="list?.tags.length" v-model="activeTab" :tabs="tabs" label="Filter by tag" class="mb-8" />

      <div v-if="pending && !list?.posts.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-80 animate-pulse rounded-2xl bg-primary/10" />
      </div>

      <div
        v-else-if="list?.posts.length"
        :class="['grid gap-6 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3', pending && 'opacity-50']"
        :aria-busy="pending"
      >
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

      <nav v-if="list && list.pageCount > 1" class="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
        <NuxtLink v-if="page > 1" :to="pageLink(page - 1)" class="pager" rel="prev" aria-label="Newer posts">
          <Icon name="material-symbols:arrow-back-rounded" class="size-5" />
        </NuxtLink>
        <NuxtLink
          v-for="n in list.pageCount"
          :key="n"
          :to="pageLink(n)"
          :class="['pager', n === page && 'pager-active']"
          :aria-current="n === page ? 'page' : undefined"
        >{{ n }}</NuxtLink>
        <NuxtLink v-if="page < list.pageCount" :to="pageLink(page + 1)" class="pager" rel="next" aria-label="Older posts">
          <Icon name="material-symbols:arrow-forward-rounded" class="size-5" />
        </NuxtLink>
      </nav>
    </BlockContainer>
  </div>
</template>

<style scoped>
.pager {
  --uno: inline-flex size-10 items-center justify-center rounded-full border border-primary/25 text-sm font-medium tabular-nums transition-colors hover:bg-primary/15;
}
.pager-active {
  --uno: border-accent bg-accent text-background hover:bg-accent;
}
</style>
