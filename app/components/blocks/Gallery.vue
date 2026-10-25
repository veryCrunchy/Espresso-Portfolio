<script setup lang="ts">
import { setAttr } from '@directus/visual-editing';
import type { BlockGallery, File } from '#shared/types';

const props = defineProps<{
  data: BlockGallery;
  priority?: boolean;
}>();

const files = computed(() =>
  (props.data.images ?? [])
    .map((item) => item.directus_files_id)
    .filter((file): file is File => !!file && typeof file === 'object'),
);

// Shuffle once on the server and reuse that order when hydrating — a shuffle inside a
// computed would produce a different order on the client and make the grid jump.
const order = useState<string[] | null>(`gallery-order:${props.data.id}`, () => {
  if (!props.data.random_order) return null;
  const ids = files.value.map((f) => f.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  }
  return ids;
});

const images = computed(() => {
  if (!order.value) return files.value;
  const rank = new Map(order.value.map((id, i) => [id, i]));
  return [...files.value].sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
});
</script>

<template>
  <BlockContainer
    :data-directus="setAttr({ collection: 'block_gallery', item: data.id ?? null, fields: 'title,headline,images,random_order', mode: 'drawer' })"
  >
    <TypographyTitle v-if="data.title">{{ data.title }}</TypographyTitle>
    <TypographyHeadline v-if="data.headline" :content="data.headline" size="lg" />
    <VGallery v-if="images.length" :items="images" />
  </BlockContainer>
</template>
