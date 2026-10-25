<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();
const notFound = computed(() => props.error.statusCode === 404);

useHead({ title: notFound.value ? 'Not found' : 'Something went wrong' });
useSeoMeta({ robots: 'noindex' });
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-background text-text">
    <SiteHeader />
    <main class="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center gap-6 px-6 py-24">
      <p class="text-sm font-medium uppercase tracking-[0.3em] text-accent">{{ error.statusCode }}</p>
      <h1 class="text-4xl font-semibold tracking-tight md:text-6xl">
        {{ notFound ? 'This page wandered off.' : 'Something spilled.' }}
      </h1>
      <p class="text-lg text-text/75">
        {{ notFound ? "It may have moved, or it never existed. Let's get you back on track." : 'Try again in a moment.' }}
      </p>
      <button
        type="button"
        class="rounded-full bg-accent px-6 py-3 font-semibold text-background transition hover:brightness-110"
        @click="clearError({ redirect: '/' })"
      >
        Back home
      </button>
    </main>
    <SiteFooter />
  </div>
</template>
