<script setup lang="ts">
defineProps<{
  buttons: { label?: string | null; href?: string | null; variant?: string | null }[];
}>();

const isExternal = (href: string) => /^https?:\/\//.test(href);
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <NuxtLink
      v-for="button in buttons"
      :key="`${button.label}-${button.href}`"
      :to="button.href!"
      :target="isExternal(button.href!) ? '_blank' : undefined"
      :class="[
        'inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all',
        button.variant === 'outline' || button.variant === 'secondary'
          ? 'border border-primary/40 hover:bg-primary/15'
          : 'bg-accent text-background hover:brightness-110',
      ]"
    >
      {{ button.label }}
      <Icon name="material-symbols:arrow-forward-rounded" class="size-4" />
    </NuxtLink>
  </div>
</template>
