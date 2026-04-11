<script lang="ts" setup>
  const { $directus, $readItems } = useNuxtApp();
  const route = useRoute();

  const slug = computed(() => {
    const path = route.path;
    let finalPath;

    if (path === "/") {
      finalPath = "/";
    } else if (path.endsWith("/")) {
      finalPath = path.slice(0, -1);
    } else {
      finalPath = path;
    }

    return { slug: { _eq: finalPath } };
  });

  const { data: page, error } = await useAsyncData(
    () => `page:${route.path}`,
    () => {
      return $directus.request(
        $readItems("pages", {
          filter: unref(slug),
          fields: [
            "*",
            {
              blocks: [
                "*",
                {
                  item: {
                    block_hero: [
                      "*",
                      {
                        image: ["id", "focal_point_x", "focal_point_y", "width", "height"],
                      },
                    ],
                    block_gallery: [
                      "*",
                      {
                        images: [
                          {
                            directus_files_id: ["id", "title", "description"],
                          },
                        ],
                      },
                    ],
                    block_richtext: ["*"],
                  },
                },
              ],
            },
          ],
          limit: 1,
        })
      );
    },
    {
      server: true,
      watch: [() => route.path],
      transform: (data) => {
        return data[0];
      },
    }
  );

  // Per-page color overrides — only inject a style tag when the page has overrides set
  useHead(computed(() => {
    const p = page.value;
    if (!p?.color_text && !p?.color_background && !p?.color_primary && !p?.color_accent) {
      return {};
    }
    const parts = [
      p.color_text ? `--color-text: ${p.color_text};` : '',
      p.color_background ? `--color-background: ${p.color_background};` : '',
      p.color_primary ? `--color-primary: ${p.color_primary};` : '',
      p.color_accent ? `--color-accent: ${p.color_accent};` : '',
    ].filter(Boolean).join('\n  ');
    return {
      style: [{ key: 'page-theme', innerHTML: `:root {\n  ${parts}\n}` }],
    };
  }));
</script>
<template>
  <PageBuilder v-if="page" :page="page" />
  <div v-else-if="error" class="px-6 py-20 text-center text-text/60">
    Page not found.
  </div>
</template>
