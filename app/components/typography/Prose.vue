<script setup lang="ts">
export interface ProseProps {
  content: string;
  size?: 'sm' | 'md' | 'lg';
}

withDefaults(defineProps<ProseProps>(), {
  size: 'md',
});

const { siteUrl } = useRuntimeConfig().public;

function isInternal(url: URL) {
  if (url.host === window.location.host) return true;
  try {
    return url.host === new URL(siteUrl).host;
  } catch {
    return false;
  }
}

// Event delegation: works for any CMS HTML, including content that changes after mount.
function onClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = (event.target as HTMLElement).closest('a');
  const href = anchor?.getAttribute('href');
  if (!anchor || !href || href.startsWith('#') || anchor.hasAttribute('download')) return;

  const url = new URL(href, window.location.href);
  if (!/^https?:$/.test(url.protocol) || !isInternal(url)) return;

  event.preventDefault();
  navigateTo({ path: url.pathname, query: Object.fromEntries(url.searchParams), hash: url.hash });
}

// External links open in a new tab; internal ones stay in place.
function decorate(el: HTMLElement | null) {
  if (!el) return;
  for (const anchor of el.querySelectorAll('a[href]')) {
    const url = new URL(anchor.getAttribute('href')!, window.location.href);
    if (/^https?:$/.test(url.protocol) && !isInternal(url)) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    } else {
      anchor.removeAttribute('target');
    }
  }
}

const el = ref<HTMLElement | null>(null);
onMounted(() => decorate(el.value));
onUpdated(() => decorate(el.value));
</script>

<template>
  <div
    ref="el"
    class="prose w-full max-w-none text-text"
    :class="{
      'text-sm': size === 'sm',
      'md:text-base lg:text-lg': size === 'md',
      'text-lg sm:text-xl': size === 'lg',
    }"
    @click="onClick"
    v-html="content"
  />
</template>

<style>
.prose {
  --un-prose-body: color-mix(in srgb, var(--color-text) 88%, transparent);
  --un-prose-headings: var(--color-text);
  --un-prose-links: var(--color-accent);
  --un-prose-bold: var(--color-text);
  --un-prose-counters: var(--color-accent);
  --un-prose-bullets: var(--color-accent);
  --un-prose-hr: color-mix(in srgb, var(--color-primary) 40%, transparent);
  --un-prose-quotes: var(--color-text);
  --un-prose-quote-borders: var(--color-accent);
  --un-prose-captions: color-mix(in srgb, var(--color-text) 60%, transparent);
  --un-prose-code: var(--color-text);
  --un-prose-borders: color-mix(in srgb, var(--color-primary) 40%, transparent);
  --un-prose-bg-soft: color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.prose img {
  border-radius: 0.75rem;
}

.prose blockquote p:first-of-type::before,
.prose blockquote p:last-of-type::after {
  content: none;
}
</style>
