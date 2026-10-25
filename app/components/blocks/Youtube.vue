<script setup lang="ts">
import { setAttr } from '@directus/visual-editing';
import type { BlockYoutube, YoutubeFeed, YoutubeVideo } from '#shared/types';

const props = defineProps<{
  data: BlockYoutube;
  priority?: boolean;
}>();

const channelId = computed(() => props.data.channel?.match(/UC[\w-]{22}/)?.[0]);
const limit = computed(() => Math.min(Math.max(props.data.limit ?? 6, 1), 15));

const { data: feed, error } = await useFetch<YoutubeFeed>(() => `/api/youtube/${channelId.value}`, {
  key: computed(() => `youtube:${channelId.value}`),
  immediate: !!channelId.value,
});

const videos = computed(() =>
  (feed.value?.videos ?? []).filter((v) => props.data.include_shorts !== false || !v.isShort).slice(0, limit.value),
);

const playing = ref<string | null>(null);

function play(video: YoutubeVideo) {
  playing.value = video.id;
}
</script>

<template>
  <BlockContainer
    v-if="channelId && !error"
    :data-directus="setAttr({ collection: 'block_youtube', item: data.id ?? null, fields: 'title,headline,channel,limit,include_shorts', mode: 'drawer' })"
  >
    <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <TypographyTitle v-if="data.title">{{ data.title }}</TypographyTitle>
        <TypographyHeadline :content="data.headline || 'Latest videos'" size="lg" />
      </div>
      <a
        v-if="feed"
        :href="`${feed.channelUrl}?sub_confirmation=1`"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-full bg-[#ff0033] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
      >
        <Icon name="simple-icons:youtube" class="size-4" /> Subscribe
      </a>
    </div>

    <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="video in videos" :key="video.id" class="group">
        <div class="relative aspect-video overflow-hidden rounded-xl bg-primary/15 ring-1 ring-primary/20">
          <iframe
            v-if="playing === video.id"
            :src="`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`"
            :title="video.title"
            class="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
          <button
            v-else
            type="button"
            class="absolute inset-0 size-full"
            :aria-label="`Play ${video.title}`"
            @click="play(video)"
          >
            <img
              :src="video.thumbnail"
              :alt="''"
              loading="lazy"
              decoding="async"
              class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            >
            <span class="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
              <span class="flex size-14 items-center justify-center rounded-full bg-black/70 text-white transition-transform group-hover:scale-110">
                <Icon name="material-symbols:play-arrow-rounded" class="size-9" />
              </span>
            </span>
            <span v-if="video.isShort" class="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-xs text-white">Short</span>
          </button>
        </div>
        <a :href="video.url" target="_blank" rel="noopener noreferrer" class="mt-3 block">
          <h3 class="line-clamp-2 font-medium leading-snug transition-colors group-hover:text-accent">{{ video.title }}</h3>
          <p class="mt-1 text-xs text-text/55">
            {{ formatDate(video.published) }}<template v-if="video.views !== null"> · {{ formatCompact(video.views) }} views</template>
          </p>
        </a>
      </li>
    </ul>
  </BlockContainer>
</template>
