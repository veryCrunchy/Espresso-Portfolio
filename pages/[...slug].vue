<script lang="ts" setup>
  const { $directus, $readItems } = useNuxtApp();
  const { path } = useRoute();

  const slug = computed(() => {
    let finalPath;

    if (path === "/") {
      // Match the homepage
      finalPath = "/";
    } else if (path.endsWith("/")) {
      // Remove any other trailing slash
      finalPath = path.slice(0, -1);
    } else {
      // Match any other page
      finalPath = path;
    }

    return { slug: { _eq: finalPath } };
  });

  const { data: page, error } = await useAsyncData(
    path,
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
                    block_hero: ["*"],
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

      transform: (data) => {
        return data[0];
      },
    }
  );
  const e = unref(error);
</script>
<template>
  {{ page }}
  <PageBuilder v-if="page" :page="page" />
  {{ e?.toJSON() }}
</template>
