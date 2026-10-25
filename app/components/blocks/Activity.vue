<script setup lang="ts">
import { setAttr } from '@directus/visual-editing';
import type { ActivityItem, BlockActivity } from '#shared/types';

const props = defineProps<{
  data: BlockActivity;
  priority?: boolean;
}>();

const { data: items } = await useCmsFetch<ActivityItem[]>('/api/activity', {
  key: computed(() => `activity:${props.data.id}`),
  query: computed(() => ({
    channel: props.data.youtube_channel || undefined,
    posts: props.data.include_posts === false ? '0' : '1',
    limit: props.data.limit ?? 6,
  })),
  default: () => [],
});

const SOURCES = {
  youtube: { label: 'YouTube', icon: 'simple-icons:youtube' },
  blog: { label: 'Blog', icon: 'material-symbols:article-rounded' },
} as const;

const isExternal = (url: string) => /^https?:\/\//.test(url);
</script>

<template>
  <BlockContainer
    v-if="items?.length"
    :data-directus="setAttr({ collection: 'block_activity', item: data.id ?? null, fields: 'title,headline,youtube_channel,include_posts,limit', mode: 'drawer' })"
  >
    <div class="mb-6">
      <TypographyTitle v-if="data.title">{{ data.title }}</TypographyTitle>
      <TypographyHeadline :content="data.headline || 'Recent activity'" size="lg" />
    </div>

    <ul class="grid gap-3 md:grid-cols-2">
      <li v-for="item in items" :key="item.id">
        <NuxtLink
          :to="item.url"
          :target="isExternal(item.url) ? '_blank' : undefined"
          class="group flex h-full items-center gap-4 rounded-2xl border border-primary/20 bg-primary/8 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/15"
        >
          <span class="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-primary/15 sm:w-40">
            <template v-if="item.image">
              <img
                v-if="item.source === 'youtube'"
                :src="item.image"
                :alt="''"
                loading="lazy"
                decoding="async"
                class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              >
              <NuxtImg
                v-else
                :src="item.image"
                :alt="''"
                width="320"
                height="180"
                fit="cover"
                loading="lazy"
                class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </template>
            <span v-else class="flex size-full items-center justify-center">
              <Icon :name="SOURCES[item.source].icon" class="size-8 text-accent" />
            </span>
            <span v-if="item.isShort" class="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 text-[10px] text-white">Short</span>
          </span>
          <span class="min-w-0 flex-1">
            <span class="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-text/55">
              <Icon :name="SOURCES[item.source].icon" :class="['size-3.5', item.source === 'youtube' ? 'text-[#ff0033]' : 'text-accent']" />
              {{ SOURCES[item.source].label }} · <time :datetime="item.date">{{ formatDate(item.date) }}</time>
            </span>
            <span class="mt-1 line-clamp-2 block font-medium leading-snug transition-colors group-hover:text-accent">{{ item.title }}</span>
            <span v-if="item.meta" class="mt-0.5 block text-xs text-text/50">{{ item.meta }}</span>
          </span>
        </NuxtLink>
      </li>
    </ul>
  </BlockContainer>
</template>
