<script setup lang="ts">
import { setAttr } from '@directus/visual-editing';
import type { BlockRichtext } from '#shared/types';

defineProps<{
  data: BlockRichtext;
  priority?: boolean;
}>();
</script>

<template>
  <BlockContainer
    :data-directus="setAttr({ collection: 'block_richtext', item: data.id ?? null, fields: 'title,headline,content,alignment', mode: 'drawer' })"
  >
    <div
      :class="{
        'text-left': data.alignment === 'left',
        'text-center': !data.alignment || data.alignment === 'center',
        'text-right': data.alignment === 'right',
      }"
    >
      <TypographyTitle v-if="data.title">{{ data.title }}</TypographyTitle>
      <TypographyHeadline v-if="data.headline" :content="data.headline" size="lg" />
    </div>
    <TypographyProse
      v-if="data.content"
      :content="data.content"
      :class="['mt-8', { 'mx-auto': !data.alignment || data.alignment === 'center' }]"
    />
  </BlockContainer>
</template>
