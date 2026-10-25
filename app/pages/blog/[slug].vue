<script setup lang="ts">
import { joinURL } from 'ufo';
import type { PostDetail } from '#shared/types';

const route = useRoute();
const slug = computed(() => String(route.params.slug));
const { siteUrl } = useRuntimeConfig().public;
const { data: settings } = useSiteSettings();
const assetUrl = useAssetUrl();

const { data, error } = await useCmsFetch<PostDetail>(() => `/api/posts/${encodeURIComponent(slug.value)}`, {
  key: computed(() => `post:${slug.value}`),
});

if (error.value || !data.value) {
  throw createError({
    statusCode: error.value?.statusCode ?? 404,
    statusMessage: error.value?.statusMessage ?? 'Post not found',
    fatal: true,
  });
}

const post = computed(() => data.value!.post);
const url = computed(() => joinURL(siteUrl, 'blog', post.value.slug));
const author = computed(() => post.value.author_name || 'Jamie N. Needham');

usePageSeo(() => ({
  title: post.value.seo_title || post.value.title,
  description: post.value.seo_description || post.value.excerpt || post.value.content,
  image: post.value.cover_image,
  type: 'article',
}));

useSeoMeta({
  articlePublishedTime: () => post.value.published_at ?? undefined,
  articleModifiedTime: () => post.value.date_updated ?? post.value.published_at ?? undefined,
  articleAuthor: () => [author.value],
  articleTag: () => post.value.tags ?? [],
});

useHead({
  script: [
    {
      key: 'ld-post',
      type: 'application/ld+json',
      innerHTML: () =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.value.title,
          description: post.value.seo_description || post.value.excerpt || undefined,
          image: assetUrl(post.value.cover_image, { width: 1200, height: 630, fit: 'cover', format: 'jpg' }),
          datePublished: post.value.published_at,
          dateModified: post.value.date_updated ?? post.value.published_at,
          keywords: post.value.tags?.join(', ') || undefined,
          author: { '@type': 'Person', name: author.value, url: siteUrl },
          publisher: { '@type': 'Person', '@id': `${siteUrl}/#person`, name: author.value },
          mainEntityOfPage: { '@type': 'WebPage', '@id': url.value },
          url: url.value,
        }),
    },
    {
      key: 'ld-breadcrumbs',
      type: 'application/ld+json',
      innerHTML: () =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: joinURL(siteUrl, 'blog') },
            { '@type': 'ListItem', position: 3, name: post.value.title, item: url.value },
          ],
        }),
    },
  ],
});

const copied = ref(false);
async function share() {
  const payload = { title: post.value.title, url: url.value };
  if (navigator.share) {
    await navigator.share(payload).catch(() => {});
    return;
  }
  await navigator.clipboard.writeText(url.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

const shareOnX = computed(() => {
  const handle = settings.value?.twitter_handle?.replace(/^@/, '');
  const params = new URLSearchParams({ text: post.value.title, url: url.value, ...(handle ? { via: handle } : {}) });
  return `https://x.com/intent/post?${params}`;
});

// Reading progress
const progress = ref(0);
const articleEl = ref<HTMLElement>();
function onScroll() {
  const el = articleEl.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  progress.value = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <div>
    <div class="fixed inset-x-0 top-0 z-40 h-0.5 origin-left bg-accent" :style="{ transform: `scaleX(${progress})` }" aria-hidden="true" />

    <article ref="articleEl" class="mx-auto max-w-3xl px-4 pb-10 pt-10 sm:px-6 lg:pt-16">
      <nav class="mb-8 text-sm" aria-label="Breadcrumb">
        <NuxtLink to="/blog" class="inline-flex items-center gap-1 text-text/65 transition-colors hover:text-accent">
          <Icon name="material-symbols:arrow-back-rounded" class="size-4" /> All posts
        </NuxtLink>
      </nav>

      <header class="space-y-5">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.18em] text-text/60">
          <time v-if="post.published_at" :datetime="post.published_at">{{ formatDate(post.published_at) }}</time>
          <span>· {{ post.reading_minutes }} min read</span>
          <span>· {{ author }}</span>
        </div>
        <h1 class="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">{{ post.title }}</h1>
        <p v-if="post.excerpt" class="text-xl leading-8 text-text/75">{{ post.excerpt }}</p>
        <ul v-if="post.tags?.length" class="flex flex-wrap gap-2">
          <li v-for="t in post.tags" :key="t">
            <NuxtLink
              :to="{ path: '/blog', query: { tag: t } }"
              class="rounded-full bg-primary/20 px-3 py-1 text-xs text-accent transition-colors hover:bg-primary/35"
            >#{{ t }}</NuxtLink>
          </li>
        </ul>
      </header>

      <figure v-if="post.cover_image" class="-mx-4 mt-10 overflow-hidden sm:mx-0 sm:rounded-2xl">
        <NuxtImg
          :src="fileId(post.cover_image)"
          :alt="(typeof post.cover_image === 'object' && post.cover_image.description) || ''"
          width="1200"
          height="675"
          fit="cover"
          sizes="md:100vw lg:768px"
          :style="focalPosition(post.cover_image)"
          class="aspect-[16/9] w-full object-cover"
          preload
          fetchpriority="high"
        />
      </figure>

      <TypographyProse v-if="post.content" :content="post.content" class="mt-10" size="md" />

      <footer class="mt-14 flex flex-wrap items-center gap-3 border-t border-primary/15 pt-8">
        <span class="mr-auto text-sm text-text/60">Enjoyed this? Pass it on.</span>
        <button type="button" class="share" @click="share">
          <Icon :name="copied ? 'material-symbols:check-rounded' : 'material-symbols:share'" class="size-4" />
          {{ copied ? 'Link copied' : 'Share' }}
        </button>
        <a :href="shareOnX" target="_blank" rel="noopener noreferrer" class="share">
          <Icon name="simple-icons:x" class="size-3.5" /> Post
        </a>
      </footer>

      <nav v-if="data?.prev || data?.next" class="mt-10 grid gap-4 sm:grid-cols-2" aria-label="More posts">
        <NuxtLink v-if="data.next" :to="`/blog/${data.next.slug}`" class="neighbour">
          <span class="text-xs uppercase tracking-[0.2em] text-text/55">Newer</span>
          <span class="font-semibold">{{ data.next.title }}</span>
        </NuxtLink>
        <span v-else class="hidden sm:block" />
        <NuxtLink v-if="data.prev" :to="`/blog/${data.prev.slug}`" class="neighbour sm:text-right">
          <span class="text-xs uppercase tracking-[0.2em] text-text/55">Older</span>
          <span class="font-semibold">{{ data.prev.title }}</span>
        </NuxtLink>
      </nav>
    </article>
  </div>
</template>

<style scoped>
.share {
  --uno: inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm transition-colors hover:border-accent/50 hover:bg-primary/15;
}
.neighbour {
  --uno: flex flex-col gap-1 rounded-2xl border border-primary/20 bg-primary/8 p-5 transition-colors hover:border-primary/45 hover:bg-primary/15;
}
</style>
