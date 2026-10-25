<script setup lang="ts">
import type { PostSummary } from '#shared/types';

const props = defineProps<{ post: PostSummary; featured?: boolean }>();
const to = computed(() => `/blog/${props.post.slug}`);
</script>

<template>
  <article
    :class="[
      'group relative flex flex-col overflow-hidden rounded-2xl border border-primary/20 bg-primary/8 transition-all duration-200 hover:-translate-y-1 hover:border-primary/45 hover:shadow-xl hover:shadow-black/30',
      featured && 'sm:col-span-2 lg:col-span-3 lg:flex-row',
    ]"
  >
    <div
      v-if="post.cover_image"
      :class="['relative overflow-hidden bg-primary/15', featured ? 'aspect-[16/9] lg:aspect-auto lg:w-3/5' : 'aspect-[16/9]']"
    >
      <NuxtImg
        :src="fileId(post.cover_image)"
        :alt="''"
        :sizes="featured ? 'lg:100vw xl:720px' : 'sm:100vw lg:50vw xl:400px'"
        :width="featured ? 1200 : 640"
        :height="featured ? 675 : 360"
        fit="cover"
        :style="focalPosition(post.cover_image)"
        class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        :loading="featured ? 'eager' : 'lazy'"
      />
    </div>

    <div :class="['flex flex-1 flex-col gap-3 p-6', featured && 'lg:justify-center lg:p-10']">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.18em] text-text/55">
        <time v-if="post.published_at" :datetime="post.published_at">{{ formatDate(post.published_at) }}</time>
        <span v-if="post.reading_minutes">· {{ post.reading_minutes }} min read</span>
        <span v-if="post.featured" class="rounded-full bg-accent/20 px-2 py-0.5 text-accent">Pinned</span>
      </div>

      <h2 :class="['font-semibold leading-snug tracking-tight', featured ? 'text-2xl md:text-4xl' : 'text-xl']">
        <NuxtLink :to="to" class="after:absolute after:inset-0 after:content-['']">{{ post.title }}</NuxtLink>
      </h2>

      <p v-if="post.excerpt" :class="['text-text/75', featured ? 'line-clamp-4 text-lg' : 'line-clamp-3']">
        {{ post.excerpt }}
      </p>

      <ul v-if="post.tags?.length" class="relative z-1 mt-auto flex flex-wrap gap-2 pt-2">
        <li v-for="t in post.tags" :key="t">
          <NuxtLink
            :to="{ path: '/blog', query: { tag: t } }"
            class="rounded-full bg-primary/20 px-2.5 py-1 text-xs text-accent transition-colors hover:bg-primary/35"
          >#{{ t }}</NuxtLink>
        </li>
      </ul>
    </div>
  </article>
</template>
