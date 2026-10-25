<script setup lang="ts">
import type { File } from '#shared/types';

export interface GalleryProps {
  items: File[];
}

const props = defineProps<GalleryProps>();

const isOpen = ref(false);
const index = ref(0);
const current = computed(() => props.items[index.value]);
const dialog = ref<HTMLElement>();
let opener: HTMLElement | null = null;

const img = useImage();
const fullSrc = (file: File) => img(file.id, { width: 2000, height: 2000, fit: 'inside', quality: 82 });

function wrap(i: number) {
  const n = props.items.length;
  return (i + n) % n;
}

function preload(i: number) {
  const file = props.items[wrap(i)];
  if (file) new Image().src = fullSrc(file);
}

function open(i: number, event: Event) {
  opener = event.currentTarget as HTMLElement;
  index.value = i;
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
}

const next = () => (index.value = wrap(index.value + 1));
const prev = () => (index.value = wrap(index.value - 1));

watch(index, (i) => {
  if (isOpen.value) {
    preload(i + 1);
    preload(i - 1);
  }
});

watch(isOpen, async (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : '';
  if (open) {
    preload(index.value + 1);
    preload(index.value - 1);
    await nextTick();
    dialog.value?.focus();
  } else {
    opener?.focus();
  }
});

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return;
  if (e.key === 'Escape') close();
  else if (e.key === 'ArrowRight') next();
  else if (e.key === 'ArrowLeft') prev();
}

// Touch swipe
let touchX: number | null = null;
function onTouchStart(e: TouchEvent) {
  touchX = e.touches[0]?.clientX ?? null;
}
function onTouchEnd(e: TouchEvent) {
  if (touchX === null) return;
  const dx = (e.changedTouches[0]?.clientX ?? touchX) - touchX;
  if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  touchX = null;
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  document.documentElement.style.overflow = '';
});
</script>

<template>
  <div class="mt-6 gap-4 columns-1 sm:columns-2 lg:columns-3">
    <button
      v-for="(item, itemIdx) in items"
      :key="item.id"
      type="button"
      class="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-primary/25 bg-primary/10"
      :aria-label="`Open ${item.title || 'image'} ${itemIdx + 1} of ${items.length}`"
      @click="open(itemIdx, $event)"
    >
      <NuxtImg
        :src="item.id"
        :alt="item.description || item.title || ''"
        :width="600"
        :height="item.width && item.height ? Math.round((600 * item.height) / item.width) : undefined"
        sizes="sm:100vw lg:50vw xl:400px"
        loading="lazy"
        class="w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <span
        class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <Icon name="material-symbols:zoom-in-rounded" class="size-12 text-text" />
      </span>
    </button>
  </div>

  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen && current"
        ref="dialog"
        class="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm outline-none"
        role="dialog"
        aria-modal="true"
        :aria-label="current.title || 'Image viewer'"
        tabindex="-1"
        @click.self="close"
        @touchstart.passive="onTouchStart"
        @touchend="onTouchEnd"
      >
        <div class="flex items-center justify-between gap-4 p-4 text-sm text-text/80">
          <span class="tabular-nums">{{ index + 1 }} / {{ items.length }}</span>
          <Button class="size-11 rounded-full" aria-label="Close" @click="close">
            <Icon name="material-symbols:close-rounded" class="size-6" />
          </Button>
        </div>

        <div class="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20" @click.self="close">
          <Button
            v-if="items.length > 1"
            class="absolute left-3 z-10 size-11 rounded-full lt-md:hidden"
            aria-label="Previous image"
            @click="prev"
          >
            <Icon name="material-symbols:arrow-back-rounded" class="size-6" />
          </Button>

          <img
            :key="current.id"
            :src="fullSrc(current)"
            :alt="current.description || current.title || ''"
            class="max-h-full max-w-full select-none rounded-lg object-contain shadow-2xl"
            draggable="false"
          >

          <Button
            v-if="items.length > 1"
            class="absolute right-3 z-10 size-11 rounded-full lt-md:hidden"
            aria-label="Next image"
            @click="next"
          >
            <Icon name="material-symbols:arrow-forward-rounded" class="size-6" />
          </Button>
        </div>

        <p v-if="current.description || current.title" class="p-4 text-center text-sm text-text/80">
          {{ current.description || current.title }}
        </p>
        <div v-else class="h-6" />
      </div>
    </Transition>
  </Teleport>
</template>
