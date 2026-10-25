<script setup lang="ts">
const { data: settings } = useSiteSettings();
const { data: links } = useLinks();
const year = new Date().getFullYear();
</script>

<template>
  <footer class="mt-10 border-t border-primary/15">
    <div class="mx-auto flex max-w-content flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-12">
      <div class="space-y-1 text-sm text-text/60">
        <p>© {{ year }} {{ settings?.site_name || "Espresso's Work" }}</p>
        <p v-if="settings?.footer_text" class="max-w-md">{{ settings.footer_text }}</p>
      </div>

      <ul class="flex flex-wrap items-center gap-2">
        <li v-for="link in links" :key="link.id">
          <a
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer me"
            :title="link.title"
            :aria-label="link.title"
            class="flex size-9 items-center justify-center rounded-full text-text/65 transition-colors hover:bg-primary/15 hover:text-accent"
          >
            <Icon :name="linkIcon(link)" class="size-4.5" />
          </a>
        </li>
        <li>
          <a
            href="/rss.xml"
            title="RSS feed"
            aria-label="RSS feed"
            class="flex size-9 items-center justify-center rounded-full text-text/65 transition-colors hover:bg-primary/15 hover:text-accent"
          >
            <Icon name="material-symbols:rss-feed-rounded" class="size-5" />
          </a>
        </li>
      </ul>
    </div>
  </footer>
</template>
