<script setup lang="ts">
import type { BlockGallery, BlockType, Page, PageBlock } from '#shared/types';

const componentMap: Record<BlockType, ReturnType<typeof resolveComponent>> = {
  block_hero: resolveComponent('BlocksHero'),
  block_richtext: resolveComponent('BlocksRichText'),
  // Below-the-fold blocks: code-split and hydrated only once scrolled into view.
  block_gallery: resolveComponent('LazyBlocksGallery'),
  block_youtube: resolveComponent('LazyBlocksYoutube'),
  block_posts: resolveComponent('LazyBlocksPosts'),
  block_links: resolveComponent('LazyBlocksLinks'),
  block_activity: resolveComponent('LazyBlocksActivity'),
};
const LAZY = new Set<BlockType>(['block_gallery', 'block_youtube', 'block_posts', 'block_links', 'block_activity']);

const props = defineProps<{ page: Page }>();

type Section =
  | { kind: 'block'; key: string; block: PageBlock & { collection: BlockType } }
  | { kind: 'gallery-tabs'; key: string; galleries: BlockGallery[] };

// Gallery blocks placed directly after each other are shown as one gallery with tabs.
const sections = computed(() => {
  const blocks = (props.page.blocks ?? []).filter(
    (block): block is PageBlock & { collection: BlockType } =>
      block.hide_block !== true && !!block.collection && !!block.item && typeof block.item === 'object' && !!componentMap[block.collection],
  );

  const result: Section[] = [];
  for (const block of blocks) {
    const prev = result.at(-1);
    if (block.collection === 'block_gallery' && prev?.kind === 'block' && prev.block.collection === 'block_gallery') {
      result[result.length - 1] = { kind: 'gallery-tabs', key: prev.key, galleries: [prev.block.item as BlockGallery, block.item as BlockGallery] };
    } else if (block.collection === 'block_gallery' && prev?.kind === 'gallery-tabs') {
      prev.galleries.push(block.item as BlockGallery);
    } else {
      result.push({ kind: 'block', key: String(block.id), block });
    }
  }
  return result;
});
</script>

<template>
  <div id="content" class="mx-auto">
    <template v-for="(section, index) in sections" :key="section.key">
      <LazyBlocksGalleryTabs v-if="section.kind === 'gallery-tabs'" :galleries="section.galleries" hydrate-on-visible />
      <component
        :is="componentMap[section.block.collection]"
        v-else
        :data="section.block.item"
        :priority="index === 0"
        v-bind="LAZY.has(section.block.collection) ? { hydrateOnVisible: true } : {}"
      />
    </template>
  </div>
</template>
