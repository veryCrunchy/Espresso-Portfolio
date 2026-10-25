<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

export interface Tab {
  key: string;
  label: string;
  count?: number;
  /** Render as a link (e.g. a filtered URL) instead of a button. */
  to?: RouteLocationRaw;
}

const props = defineProps<{
  tabs: Tab[];
  label: string;
  /** id prefix used to link tabs with their panels (button tabs only). */
  idPrefix?: string;
}>();

const active = defineModel<string>({ required: true });

const buttons = ref<HTMLElement[]>([]);

function onKeydown(event: KeyboardEvent, index: number) {
  const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: props.tabs.length - 1 - index };
  const delta = moves[event.key];
  if (delta === undefined) return;
  event.preventDefault();
  const next = (index + delta + props.tabs.length) % props.tabs.length;
  active.value = props.tabs[next]!.key;
  buttons.value[next]?.focus();
}

// Keep the active tab visible when the bar scrolls horizontally on small screens.
const bar = ref<HTMLElement>();
watch(active, async () => {
  await nextTick();
  bar.value?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
});
</script>

<template>
  <div ref="bar" class="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
    <div
      class="inline-flex gap-1 rounded-full border border-primary/25 bg-primary/8 p-1"
      :role="tabs[0]?.to ? undefined : 'tablist'"
      :aria-label="label"
    >
      <template v-for="(tab, index) in tabs" :key="tab.key">
        <NuxtLink
          v-if="tab.to"
          :to="tab.to"
          :data-active="tab.key === active"
          :aria-current="tab.key === active ? 'true' : undefined"
          :class="['tab', tab.key === active && 'tab-active']"
          @click="active = tab.key"
        >
          {{ tab.label }}<span v-if="tab.count != null" class="tab-count">{{ tab.count }}</span>
        </NuxtLink>
        <button
          v-else
          :id="idPrefix && `${idPrefix}-tab-${tab.key}`"
          ref="buttons"
          type="button"
          role="tab"
          :data-active="tab.key === active"
          :aria-selected="tab.key === active"
          :aria-controls="idPrefix && `${idPrefix}-panel`"
          :tabindex="tab.key === active ? 0 : -1"
          :class="['tab', tab.key === active && 'tab-active']"
          @click="active = tab.key"
          @keydown="onKeydown($event, index)"
        >
          {{ tab.label }}<span v-if="tab.count != null" class="tab-count">{{ tab.count }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tab {
  --uno: inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-text/55 transition-colors duration-200;
  --uno: hover:bg-primary/15 hover:text-text;
}
.tab-active {
  --uno: bg-accent text-background hover:bg-accent hover:text-background;
}
.tab-count {
  --uno: rounded-full bg-text/10 px-1.5 text-xs tabular-nums;
}
.tab-active .tab-count {
  --uno: bg-background/20;
}
</style>
