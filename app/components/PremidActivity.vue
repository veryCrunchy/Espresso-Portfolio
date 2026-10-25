<script setup lang="ts">
import type { PreMIDActivity } from '#shared/types';

const POLL_MS = 15_000;

const activity = ref<PreMIDActivity | null>(null);
const now = ref(Date.now());

const startedAt = computed(() => {
  const start = activity.value?.timestamps?.start;
  if (!start) return null;
  return start < 1e12 ? start * 1000 : start; // seconds or milliseconds
});
const link = computed(() => activity.value?.buttons?.[0]?.url);

let pollTimer: ReturnType<typeof setInterval> | undefined;
let clockTimer: ReturnType<typeof setInterval> | undefined;

async function fetchActivity() {
  if (document.hidden) return;
  try {
    const res = await $fetch<{ activity: PreMIDActivity | null }>('/api/premid');
    activity.value = res.activity;
  } catch {
    // fail silently — the widget just stays hidden
  }
}

function onVisibility() {
  if (!document.hidden) fetchActivity();
}

onMounted(() => {
  fetchActivity();
  pollTimer = setInterval(fetchActivity, POLL_MS);
  clockTimer = setInterval(() => (now.value = Date.now()), 1000);
  document.addEventListener('visibilitychange', onVisibility);
});

onBeforeUnmount(() => {
  clearInterval(pollTimer);
  clearInterval(clockTimer);
  document.removeEventListener('visibilitychange', onVisibility);
});
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-90"
    leave-active-class="transition-all duration-200 ease-in"
    leave-to-class="opacity-0 scale-90"
  >
    <component
      :is="link ? 'a' : 'div'"
      v-if="activity"
      :href="link"
      :target="link ? '_blank' : undefined"
      :rel="link ? 'noopener noreferrer' : undefined"
      class="items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs text-text/90 transition-colors hover:border-accent/40 hover:bg-accent/15"
      :title="[activity.name, activity.details, activity.state].filter(Boolean).join(' · ')"
    >
      <span class="relative flex size-2 shrink-0" aria-hidden="true">
        <span class="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
        <span class="relative inline-flex size-2 rounded-full bg-accent" />
      </span>
      <span class="max-w-[260px] truncate">
        <span class="font-medium text-accent">{{ activity.name }}</span>
        <template v-if="activity.details">
          <span class="mx-1 text-text/40">·</span>{{ activity.details }}
        </template>
        <template v-if="activity.state">
          <span class="mx-1 text-text/40">—</span><span class="text-text/65">{{ activity.state }}</span>
        </template>
      </span>
      <span v-if="startedAt" class="tabular-nums text-text/50">{{ elapsed(startedAt, now) }}</span>
    </component>
  </Transition>
</template>
