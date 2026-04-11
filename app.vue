<template>
  <div class="min-h-dvh bg-background text-text">
    <header class="sticky top-0 z-20 border-b border-primary/20 bg-background/90 backdrop-blur-md">
      <nav class="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 lg:px-16">
        <NuxtLink to="/" class="text-sm font-semibold uppercase tracking-[0.35em] text-accent">
          Espresso's Work
        </NuxtLink>

        <div class="flex items-center gap-2 text-sm font-medium text-text/95">
          <!-- PreMID activity pill -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-90"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-90"
          >
            <a
              v-if="activity"
              :href="activity.buttons?.[0]?.url"
              :target="activity.buttons?.[0]?.url ? '_blank' : undefined"
              :rel="activity.buttons?.[0]?.url ? 'noopener noreferrer' : undefined"
              class="hidden items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-3 py-1.5 text-xs text-text/90 transition-colors hover:border-accent/35 hover:bg-accent/12 lg:flex"
              :title="activity.details ?? activity.name"
            >
              <!-- pulsing dot -->
              <span class="relative flex h-2 w-2 shrink-0">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span class="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span class="max-w-[180px] truncate">
                <span class="font-medium text-accent">{{ activity.name }}</span>
                <template v-if="activity.details">
                  <span class="mx-1 text-text/40">·</span>{{ activity.details }}
                </template>
              </span>
            </a>
          </Transition>

          <NuxtLink
            to="/"
            class="rounded-full border border-transparent px-4 py-2 transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-text"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/links"
            class="rounded-full border border-transparent px-4 py-2 transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-text"
          >
            Links
          </NuxtLink>
          <NuxtLink
            to="/testimonials"
            class="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-text transition-colors hover:bg-primary/20"
          >
            Testimonials
          </NuxtLink>
        </div>
      </nav>
    </header>

    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import type { SiteSettings } from '~/types/content/site-settings';
import type { PreMIDActivity } from '~/types/premid';

const { data: theme } = await useAsyncData<SiteSettings>(
  'site-settings',
  () => $fetch('/api/site-settings'),
  {
    default: () => ({
      id: 0,
      color_text: 'rgb(255, 204, 129)',
      color_background: 'rgb(19, 12, 9)',
      color_primary: 'rgb(184, 139, 71)',
      color_secondary: 'rgb(110, 90, 61)',
      color_accent: 'rgb(183, 151, 102)',
    }),
  }
);

useHead({
  style: [
    {
      key: 'theme',
      innerHTML: computed(
        () => `:root {
  --color-text: ${theme.value?.color_text};
  --color-background: ${theme.value?.color_background};
  --color-primary: ${theme.value?.color_primary};
  --color-secondary: ${theme.value?.color_secondary};
  --color-accent: ${theme.value?.color_accent};
}`
      ),
    },
  ],
});

// PreMID activity — poll every 15s client-side only
const activity = ref<PreMIDActivity | null>(null);

if (import.meta.client) {
  async function fetchActivity() {
    try {
      const res = await $fetch<{ activity: PreMIDActivity | null }>('/api/premid');
      activity.value = res.activity;
    } catch {
      // fail silently — widget just stays hidden
    }
  }

  fetchActivity();
  const interval = setInterval(fetchActivity, 15_000);
  onUnmounted(() => clearInterval(interval));
}
</script>

<style>
  body {
    --uno: bg-background color-text;
    margin: 0;
  }

  div {
    font-family: sans-serif;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
</style>
