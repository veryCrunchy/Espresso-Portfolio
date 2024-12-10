<script setup lang="ts">
  import type { File } from "~/types";
  import { TransitionRoot } from "@headlessui/vue";

  export interface GalleryProps {
    items: File[];
  }

  const props = defineProps<GalleryProps>();

  const isOpen = ref(false);
  const currentItemIdx = ref(0);

  const currentItem = computed(() => {
    return props.items[currentItemIdx.value];
  });

  function next() {
    // If the current item is the last item, go back to the first item
    currentItemIdx.value =
      currentItemIdx.value === props.items.length - 1
        ? 0
        : currentItemIdx.value + 1;
  }

  function prev() {
    // If the current item is the first item, go to the last item
    currentItemIdx.value =
      currentItemIdx.value === 0
        ? props.items.length - 1
        : currentItemIdx.value - 1;
  }

  function toggle() {
    isOpen.value = !isOpen.value;
  }

  const isHelpOpen = ref(false);

  function toggleHelp() {
    isHelpOpen.value = !isHelpOpen.value;
  }

  // Add keyboard navigation
  function onKeydown(e: KeyboardEvent) {
    if (!isOpen.value) return;

    if (e.key === "Escape") {
      toggle();
    }

    if (e.key === "ArrowRight") {
      next();
    }

    if (e.key === "ArrowLeft") {
      prev();
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", onKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", onKeydown);
  });
</script>
<template>
  <!-- Gallery -->
  <div class="gap-4 mt-4 md:columns-3">
    <button
      v-for="(item, itemIdx) in items"
      :key="item.id"
      :class="[
        'block relative w-full mb-6 overflow-hidden border rounded-md border-secondary rounded-lg focus:outline-none',
      ]"
      @click="
        () => {
          currentItemIdx = itemIdx;
          toggle();
        }
      "
    >
      <div class="relative block w-full overflow-hidden group">
        <NuxtImg
          :src="item.id"
          :alt="item.description ?? ''"
          class="object-cover w-full transition duration-300 group-hover:scale-110 group-hover:rotate-1"
        />
        <div
          class="absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-opacity-75 opacity-0 hover:opacity-100 bg-gray-900 dark:bg-opacity-75"
        >
          <Icon
            name="material-symbols:zoom-in-rounded"
            class="w-12 h-12 text-primary"
          />
        </div>
      </div>
    </button>
  </div>
  <!-- Gallery Modal -->
  <TransitionRoot
    :show="isOpen"
    enter="ease-out duration-300"
    enter-from="opacity-0"
    enter-to="opacity-100"
    leave="ease-in duration-200"
    leave-from="opacity-100"
    leave-to="opacity-0"
  >
    <div
      class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gray-900 bg-opacity-75"
    >
      <div
        class="relative flex flex-col items-center justify-center w-full h-full max-w-7xl"
      >
        <!-- Close Button -->

        <Button
          class="absolute z-50 size-12 top-4 right-4 rounded-md"
          size="xl"
          @click="toggle"
        >
          <Icon
            name="material-symbols:close-rounded"
            class="size-8 color-background"
          />
        </Button>
        <div class="flex items-center justify-center w-full h-full">
          <!-- Nav Buttons -->

          <Button
            class="absolute z-50 size-12 left-4 rounded-md"
            size="xl"
            @click="prev"
          >
            <Icon
              name="material-symbols:arrow-back-rounded"
              class="size-8 color-background "
            />
          </Button>
          <Button
            class="absolute z-50 size-12 right-4 rounded-md"
            size="xl"
            @click="next"
          >
            <Icon
              name="material-symbols:arrow-forward-rounded"
              class="size-8 color-background"
            />
          </Button>
          <!-- Image -->
          <div
            class="relative flex flex-col items-center justify-center w-full h-full p-20 mx-auto"
          >
            <p
              v-if="currentItem.description"
              class="inline-block px-6 py-2 text-sm text-white bg-gray-900 rounded-t-xl"
            >
              {{ currentItem.description }}
            </p>

            <template v-for="(item, itemIdx) in items" :key="item.id">
              <NuxtImg
                v-show="currentItemIdx === itemIdx"
                :src="item.id"
                :alt="item.description ?? ''"
                class="object-contain w-full h-full rounded-card"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </TransitionRoot>
</template>
