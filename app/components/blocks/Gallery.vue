<script setup lang="ts">
import { setAttr } from '@directus/visual-editing';
import type { BlockGallery } from '#shared/types';

const props = defineProps<{
  data: BlockGallery;
  priority?: boolean;
}>();

const images = useGalleryImages(() => props.data);
</script>

<template>
  <BlockContainer
    :data-directus="setAttr({ collection: 'block_gallery', item: data.id ?? null, fields: 'title,headline,images,random_order', mode: 'drawer' })"
  >
    <TypographyTitle v-if="data.title">{{ data.title }}</TypographyTitle>
    <TypographyHeadline v-if="data.headline" :content="data.headline" size="lg" />
    <VGallery v-if="images.length" :items="images" :limit="9" />
  </BlockContainer>
</template>
