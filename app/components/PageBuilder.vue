<script setup lang="ts">
import type { BlockType, Page } from '#shared/types';

const componentMap: Record<BlockType, ReturnType<typeof resolveComponent>> = {
  block_hero: resolveComponent('BlocksHero'),
  block_richtext: resolveComponent('BlocksRichText'),
  // Below-the-fold blocks: code-split and hydrated only once scrolled into view.
  block_gallery: resolveComponent('LazyBlocksGallery'),
  block_youtube: resolveComponent('LazyBlocksYoutube'),
  block_posts: resolveComponent('LazyBlocksPosts'),
  block_links: resolveComponent('LazyBlocksLinks'),
};
const LAZY = new Set<BlockType>(['block_gallery', 'block_youtube', 'block_posts', 'block_links']);

const props = defineProps<{ page: Page }>();

const blocks = computed(() =>
  (props.page.blocks ?? []).filter(
    (block) => block.hide_block !== true && block.collection && block.item && typeof block.item === 'object' && componentMap[block.collection],
  ),
);
</script>

<template>
  <div id="content" class="mx-auto">
    <component
      :is="componentMap[block.collection!]"
      v-for="(block, index) in blocks"
      :key="block.id"
      :data="block.item"
      :priority="index === 0"
      v-bind="LAZY.has(block.collection!) ? { hydrateOnVisible: true } : {}"
    />
  </div>
</template>
