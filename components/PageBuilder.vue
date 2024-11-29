<script setup lang="ts">
  import type { Page, PageBlock, BlockType } from "~/types";

  const componentMap: Record<BlockType, any> = {
    block_hero: resolveComponent("BlocksHero"),
    block_gallery: resolveComponent("BlocksGallery"),
    block_richtext: resolveComponent("BlocksRichText"),
  };

  const props = defineProps<{
    page: Page;
  }>();

  const blocks = computed(() => {
    const blocks = unref(props.page as Page)?.blocks as PageBlock[];
    return blocks?.filter((block) => {
      return block.hide_block !== true;
    });
  });
</script>
<template>
  <div id="content" class="mx-auto">
    <template v-for="block in blocks" :key="block.id">
      <component
        :is="componentMap[block.collection]"
        v-if="block && block.collection"
        :data="block.item"
      />
    </template>
  </div>
</template>
