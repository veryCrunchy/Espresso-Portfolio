<script setup lang="ts">
import type { Link } from '#shared/types';

defineProps<{ links: Link[] }>();

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
</script>

<template>
  <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <li v-for="link in links" :key="link.id">
      <a
        :href="link.url"
        :target="link.open_new_tab ? '_blank' : undefined"
        :rel="link.open_new_tab ? 'noopener noreferrer me' : 'me'"
        class="group flex h-full items-center gap-4 rounded-2xl border border-primary/20 bg-primary/8 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/15 hover:shadow-lg hover:shadow-black/30"
      >
        <span class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background/60 ring-1 ring-primary/20">
          <NuxtImg
            v-if="link.image"
            :src="fileId(link.image)"
            :alt="''"
            width="48"
            height="48"
            fit="cover"
            class="size-full object-cover"
            loading="lazy"
          />
          <Icon v-else :name="linkIcon(link)" class="size-6 text-accent transition-transform duration-200 group-hover:scale-110" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate font-semibold">{{ link.title }}</span>
          <span class="block truncate text-sm text-text/60">{{ link.description || host(link.url) }}</span>
        </span>
        <Icon
          name="material-symbols:arrow-outward-rounded"
          class="size-5 shrink-0 text-text/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
        />
      </a>
    </li>
  </ul>
</template>
