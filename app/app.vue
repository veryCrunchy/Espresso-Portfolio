<template>
  <div class="flex min-h-dvh flex-col bg-background text-text">
    <NuxtLoadingIndicator color="var(--color-accent)" :height="2" />
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-background"
    >Skip to content</a>
    <SiteHeader />
    <main id="main" class="flex-1">
      <NuxtPage />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
const { data: theme } = useSiteSettings();

const siteName = computed(() => theme.value?.site_name || "Espresso's Work");

useHead({
  titleTemplate: (title) => (title && title !== siteName.value ? `${title} · ${siteName.value}` : siteName.value),
  meta: [{ name: 'theme-color', content: () => theme.value?.color_background || DEFAULT_THEME.color_background }],
  style: [
    {
      key: 'theme',
      innerHTML: () => {
        const t = { ...DEFAULT_THEME, ...theme.value };
        return `:root {
  --color-text: ${t.color_text};
  --color-background: ${t.color_background};
  --color-primary: ${t.color_primary};
  --color-secondary: ${t.color_secondary};
  --color-accent: ${t.color_accent};
}`;
      },
    },
  ],
});

usePageSeo({});

useSchemaOrg();

function useSchemaOrg() {
  const { siteUrl } = useRuntimeConfig().public;
  const { data: links } = useLinks();
  useHead({
    script: [
      {
        key: 'ld-website',
        type: 'application/ld+json',
        innerHTML: () =>
          JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: siteUrl, name: siteName.value },
              {
                '@type': 'Person',
                '@id': `${siteUrl}/#person`,
                name: 'Jamie N. Needham',
                url: siteUrl,
                sameAs: (links.value ?? []).map((l) => l.url).filter((u) => /^https?:/.test(u)),
              },
            ],
          }),
      },
    ],
  });
}
</script>
