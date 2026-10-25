<script setup lang="ts">
import { setAttr } from '@directus/visual-editing';
import type { BlockHero, File } from '#shared/types';

interface HeroButton {
  label?: string | null;
  href?: string | null;
  variant?: string | null;
}

const props = defineProps<{
  data: BlockHero;
  priority?: boolean;
}>();

const image = computed(() => (typeof props.data.image === 'object' ? (props.data.image as File | null) : null));
const ratio = computed(() =>
  image.value?.width && image.value?.height ? image.value.height / image.value.width : 4 / 3,
);
const buttons = computed(() =>
  (Array.isArray(props.data.buttons) ? (props.data.buttons as HeroButton[]) : []).filter((b) => b?.label && b?.href),
);
</script>

<template>
  <BlockContainer
    class="relative flex h-min gap-10 lt-md:flex-col md:gap-12"
    :data-directus="setAttr({ collection: 'block_hero', item: data.id ?? null, fields: 'title,headline,content,image,buttons,text_alignment,image_position', mode: 'drawer' })"
  >
    <div class="my-auto flex-2 md:pt-12">
      <div
        class="flex w-full flex-col text-left"
        :class="{ 'items-end text-right': data.text_alignment === 'right' }"
      >
        <TypographyTitle v-if="data.title">{{ data.title }}</TypographyTitle>
        <TypographyHeadline v-if="data.headline" :content="data.headline" size="title" :as="priority ? 'h1' : 'h2'" />
        <TypographyProse v-if="data.content" :content="data.content" size="lg" class="md:py-6" />
      </div>
      <BlocksButtonGroup
        v-if="buttons.length"
        :buttons="buttons"
        :class="['mt-6', data.text_alignment === 'right' && 'md:justify-end']"
      />
    </div>

    <div
      v-if="data.image"
      class="min-w-2/7 flex-1 lt-md:order-first"
      :class="{ 'order-first': data.image_position === 'left' }"
    >
      <NuxtImg
        :src="fileId(data.image)"
        :alt="image?.description || image?.title || ''"
        sizes="md:100vw lg:45vw xl:420px"
        width="840"
        :height="Math.round(840 * ratio)"
        :style="focalPosition(image)"
        class="h-full w-full rounded-2xl object-cover shadow-xl shadow-black/30 lt-md:(h-60vw max-h-md min-h-xs)"
        :loading="priority ? 'eager' : 'lazy'"
        :preload="priority"
        :fetchpriority="priority ? 'high' : 'auto'"
      />
    </div>
  </BlockContainer>
</template>
