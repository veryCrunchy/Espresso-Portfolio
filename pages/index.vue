<script lang="ts" setup>
  const { $directus, $readItems } = useNuxtApp();
  const slug = "test";

  const pages = await $directus.request(
    $readItems("pages", {
      filter: {
        slug: { _eq: slug },
      },
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
  const page = pages[0];
</script>
<template>
  <PageBuilder :page="page" />
  <div>{{ page.blocks }}</div>
</template>
<style></style>
