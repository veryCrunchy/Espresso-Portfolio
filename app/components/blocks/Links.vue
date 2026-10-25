<script setup lang="ts">
import { setAttr } from '@directus/visual-editing';
import type { BlockLinks } from '#shared/types';

defineProps<{
  data: BlockLinks;
  priority?: boolean;
}>();

const { data: links } = await useLinks();
</script>

<template>
  <BlockContainer
    v-if="links?.length"
    :data-directus="setAttr({ collection: 'block_links', item: data.id ?? null, fields: 'title,headline', mode: 'drawer' })"
  >
    <div class="mb-8">
      <TypographyTitle v-if="data.title">{{ data.title }}</TypographyTitle>
      <TypographyHeadline :content="data.headline || 'Find me elsewhere'" size="lg" />
    </div>
    <LinkGrid :links="links" />
  </BlockContainer>
</template>
