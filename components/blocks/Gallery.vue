<script setup lang="ts">
  import type { BlockGallery, BlockGalleryFile, File } from "~/types";

  const props = defineProps<{
    data: BlockGallery;
  }>();

  const images = computed(() => {
    return props.data.images?.map((item: BlockGalleryFile) => {
      const file = item.directus_files_id as File;
      file.id = useFiles().fileUrl(file.id) ?? file.id;
      return file;
    });
  });
</script>

<template>
  {{ data }}
  <BlockContainer>
    <TypographyTitle v-if="data.title">{{ data.title }}</TypographyTitle>
    <TypographyHeadline
      v-if="data.headline"
      :content="data.headline"
      size="lg"
    />
    <VGallery v-if="images && images.length > 0" :items="images" />
  </BlockContainer>
</template>
