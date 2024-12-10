<script setup lang="ts">
  import type { BlockHero, BlockButtonGroup, File } from "~/types";

  const props = defineProps<{
    data: BlockHero;
  }>();
  const img = props.data.image as File;
  const imagePosition = computed(() => {
    if (
      img.focal_point_x !== null &&
      img.focal_point_y !== null &&
      img.width &&
      img.height
    ) {
      return {
        "object-position": `${(img.focal_point_x / img.width) * 100}% ${
          (img.focal_point_y / img.height) * 100
        }%`,
      };
    }
  });
</script>
<template>
  <BlockContainer class="relative flex lt-md:flex-col h-min gap-12">
    <!-- Content -->
    <div class="md:pt-12 flex-2 my-a">
      <span
        class="text-left flex w-full flex-col"
        :class="{
          'text-right items-end': $props.data.text_alignment === 'right',
        }"
      >
        <TypographyTitle v-if="data.title">
          {{ data.title }}
        </TypographyTitle>
        <TypographyHeadline
          v-if="data.headline"
          :content="data.headline"
          size="title"
          as="h1" />
        <TypographyProse
          v-if="data.content"
          :content="data.content"
          size="lg"
          class="md:py-6"
      /></span>
      <BlocksButtonGroup
        v-if="data.buttons"
        :data="(data.buttons as BlockButtonGroup)"
      />
    </div>
    <!-- Image -->
    <div
      v-if="data.image"
      class="lt-md:order-first min-w-2/7 flex-1 shadow-md dark:border-gray-700"
      :class="{ 'order-first': data.image_position === 'left' }"
    >
      <NuxtImg
        :style="imagePosition"
        :width="img.width!"
        :height="img.width!"
        class="lt-md:(max-h-md h-60vw min-h-xs) h-full w-full dark:brightness-90 object-cover rounded-2xl"
        :src="useFile(data.image as string)"
        alt="Hero Image"
      />
    </div>
  </BlockContainer>
</template>
