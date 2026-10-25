<script setup lang="ts">
import { setAttr } from '@directus/visual-editing';
import type { BlockGallery } from '#shared/types';

/** Consecutive gallery blocks on a page, shown as one gallery with a tab per block. */
const props = defineProps<{
  galleries: BlockGallery[];
  priority?: boolean;
}>();

const route = useRoute();
const router = useRouter();

const slugify = (value: string) => value.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const labelOf = (g: BlockGallery, i: number) => (g.title || g.headline || '').replace(/<[^>]+>/g, '').trim() || `Gallery ${i + 1}`;

// Every gallery keeps its own (server-stable) image order.
const imageLists = props.galleries.map((g) => useGalleryImages(() => g));

const tabs = computed(() =>
  props.galleries.map((g, i) => ({ key: slugify(labelOf(g, i)) || String(i), label: labelOf(g, i), count: imageLists[i]!.value.length })),
);

// The selected tab lives in the URL (?gallery=3d-animation) so it survives reloads and can be shared.
const active = computed({
  get: () => {
    const wanted = route.query.gallery;
    return tabs.value.find((t) => t.key === wanted)?.key ?? tabs.value[0]!.key;
  },
  set: (key) => {
    router.replace({ query: { ...route.query, gallery: key === tabs.value[0]!.key ? undefined : key } });
  },
});

const index = computed(() => Math.max(0, tabs.value.findIndex((t) => t.key === active.value)));
const current = computed(() => props.galleries[index.value]!);
const images = computed(() => imageLists[index.value]!.value);
const panelId = useId();
</script>

<template>
  <BlockContainer>
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <TabBar v-model="active" :tabs="tabs" label="Galleries" :id-prefix="panelId" />
    </div>

    <div
      :id="`${panelId}-panel`"
      role="tabpanel"
      :aria-labelledby="`${panelId}-tab-${active}`"
      :data-directus="setAttr({ collection: 'block_gallery', item: current.id ?? null, fields: 'title,headline,images,random_order', mode: 'drawer' })"
    >
      <Transition mode="out-in" enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-1" leave-active-class="transition duration-100 ease-in" leave-to-class="opacity-0">
        <VGallery :key="active" :items="images" :limit="9" class="!mt-0" />
      </Transition>
    </div>
  </BlockContainer>
</template>
