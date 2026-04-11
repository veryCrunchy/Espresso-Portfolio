<script setup lang="ts">
  import { setAttr } from '@directus/visual-editing';
  import type { BlockGallery, BlockGalleryFile, File } from "~/types";

  const props = defineProps<{
    data: BlockGallery;
  }>();

  const images = computed(() => {
    const mappedImages = props.data.images
      ?.map((item: BlockGalleryFile) => {
        const file = item.directus_files_id as File;
        if (file) return { ...file, id: useFile(file.id) ?? file.id };
      })
      .filter((i) => i !== undefined);

    if (props.data.random_order && mappedImages) {
      return mappedImages.sort(() => Math.random() - 0.5);
    }

    return mappedImages;
  });
</script>

<template>
  <BlockContainer
    :data-directus="setAttr({ collection: 'block_gallery', item: data.id, fields: 'title,headline,images,random_order', mode: 'drawer' })"
  >
    <TypographyTitle v-if="data.title">{{ data.title }}</TypographyTitle>
    <TypographyHeadline
      v-if="data.headline"
      :content="data.headline"
      size="lg"
    />
    <VGallery v-if="images && images.length > 0" :items="images" />
  </BlockContainer>
</template>
