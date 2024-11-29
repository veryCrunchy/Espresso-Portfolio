<script setup lang="ts">
  import type { BlockHero, BlockButtonGroup } from "~/types";

  defineProps<{
    data: BlockHero;
  }>();
</script>
<template>
  <BlockContainer class="relative grid gap-12 md:grid-cols-3">
    <!-- Content -->
    <div class="md:pt-12 md:col-span-2">
      <TypographyTitle v-if="data.title">
        {{ data.title }}
      </TypographyTitle>
      <TypographyHeadline
        v-if="data.headline"
        :content="data.headline"
        size="title"
        as="h1"
      />
      <TypographyProse
        v-if="data.content"
        :content="data.content"
        size="lg"
        class="py-6 font-display"
      />
      <BlocksButtonGroup
        v-if="data.buttons"
        :data="data.buttons as BlockButtonGroup"
      />
    </div>
    <!-- Image -->
    <div
      v-if="data.image"
      class="border lg:relative lg:h-full dark:border-gray-700 h-full rounded-2xl"
      :class="{ 'order-first': data.image_position === 'left' }"
    >
      <NuxtImg
        v-if="data.image"
        class="w-full dark:brightness-90 h-full min-w-full object-cover rounded-2xl"
        :src="useFile(data.image as string)"
        alt=""
      />
    </div>
  </BlockContainer>
</template>
