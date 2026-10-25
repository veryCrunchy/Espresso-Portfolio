<script setup lang="ts">
import type { NavItem } from '#shared/types';

const DEFAULT_NAV: NavItem[] = [
  { label: 'Home', url: '/' },
  { label: 'Blog', url: '/blog' },
  { label: 'Links', url: '/links' },
  { label: 'Testimonials', url: '/testimonials' },
];

const { data: settings } = useSiteSettings();
const route = useRoute();

const nav = computed(() => (settings.value?.navigation?.length ? settings.value.navigation : DEFAULT_NAV));
const siteName = computed(() => settings.value?.site_name || "Espresso's Work");
const isExternal = (url: string) => /^https?:\/\//.test(url);
const isActive = (url: string) => (url === '/' ? route.path === '/' : route.path === url || route.path.startsWith(`${url}/`));

const menuOpen = ref(false);
watch(() => route.fullPath, () => (menuOpen.value = false));
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-primary/20 bg-background/85 backdrop-blur-md">
    <nav class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-16" aria-label="Main">
      <NuxtLink to="/" class="shrink-0 text-xs font-semibold uppercase tracking-[0.3em] text-accent sm:text-sm sm:tracking-[0.35em]">
        {{ siteName }}
      </NuxtLink>

      <div class="flex items-center gap-1 text-sm font-medium">
        <PremidActivity class="mr-2 hidden lg:flex" />

        <ul class="hidden items-center gap-1 md:flex">
          <li v-for="item in nav" :key="item.url">
            <NuxtLink
              :to="item.url"
              :target="isExternal(item.url) ? '_blank' : undefined"
              :class="[
                'rounded-full border px-4 py-2 transition-colors hover:border-primary/40 hover:bg-primary/15',
                isActive(item.url) ? 'border-primary/40 bg-primary/15' : 'border-transparent',
              ]"
              :aria-current="isActive(item.url) ? 'page' : undefined"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>

        <button
          type="button"
          class="flex size-10 items-center justify-center rounded-full border border-primary/25 transition-colors hover:bg-primary/15 md:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <Icon :name="menuOpen ? 'material-symbols:close-rounded' : 'material-symbols:menu-rounded'" class="size-6" />
        </button>
      </div>
    </nav>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <ul v-if="menuOpen" id="mobile-menu" class="grid gap-1 border-t border-primary/15 px-4 pb-4 pt-2 md:hidden">
        <li v-for="item in nav" :key="item.url">
          <NuxtLink
            :to="item.url"
            :target="isExternal(item.url) ? '_blank' : undefined"
            :class="[
              'block rounded-xl px-4 py-3 text-base transition-colors hover:bg-primary/15',
              isActive(item.url) ? 'bg-primary/15 text-accent' : '',
            ]"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </Transition>
  </header>
</template>
