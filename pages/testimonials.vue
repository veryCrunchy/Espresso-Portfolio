<script setup lang="ts">
  import type { Testimonial, TestimonialsPage, TestimonialSubmission } from '~/types';

  const config = useRuntimeConfig();
  const directusUrl = config.public.directusUrl;

  const [{ data: cms }, { data: testimonials, error: testimonialsError, pending }] =
    await Promise.all([
      useAsyncData('testimonials-page', () => $fetch<TestimonialsPage>('/api/testimonials-page')),
      useAsyncData('published-testimonials', () => $fetch<Testimonial[]>('/api/testimonials')),
    ]);

  useSeoMeta({
    title: computed(() => cms.value?.eyebrow ?? 'Testimonials'),
    description: computed(() => cms.value?.description ?? ''),
  });

  function assetUrl(id: string) {
    return `${directusUrl}/assets/${id}`;
  }

  const form = reactive<TestimonialSubmission>({ name: '', subject: '', quote: '' });
  const submitError = ref('');
  const submitSuccess = ref('');
  const isSubmitting = ref(false);

  async function submitTestimonial() {
    submitError.value = '';
    submitSuccess.value = '';

    if (!form.name.trim() || !form.subject.trim() || !form.quote.trim()) {
      submitError.value = 'Please fill in all three fields.';
      return;
    }

    isSubmitting.value = true;

    try {
      await $fetch('/api/testimonials', { method: 'POST', body: form });
      form.name = '';
      form.subject = '';
      form.quote = '';
      submitSuccess.value = cms.value?.success_message ?? 'Submitted — pending approval.';
    } catch (err) {
      submitError.value =
        err instanceof Error ? err.message : 'Something went wrong — try again in a moment.';
    } finally {
      isSubmitting.value = false;
    }
  }
</script>

<template>
  <BlockContainer class="py-10 lg:py-20">
    <!-- Page header -->
    <div class="mb-12 max-w-2xl space-y-4">
      <TypographyTitle as="p">{{ cms?.eyebrow }}</TypographyTitle>
      <TypographyHeadline as="h1" size="title" :content="cms?.headline ?? ''" />
      <p class="text-lg leading-8 text-text/95">
        {{ cms?.description }}
      </p>
    </div>

    <div class="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">

      <!-- Left: testimonials list -->
      <section>
        <div v-if="pending" class="grid gap-4">
          <div
            v-for="i in 3"
            :key="i"
            class="h-36 animate-pulse rounded-2xl bg-primary/10"
          />
        </div>

        <div v-else-if="testimonials?.length" class="grid gap-5">
          <article
            v-for="t in testimonials"
            :key="t.id"
            class="group relative rounded-2xl border border-primary/15 bg-primary/6 p-6 transition-colors hover:border-primary/30 hover:bg-primary/10"
          >
            <!-- large decorative quote mark -->
            <span
              aria-hidden="true"
              class="absolute right-5 top-4 select-none text-6xl leading-none text-primary/15 font-serif"
            >"</span>

            <p class="relative z-1 whitespace-pre-line text-base leading-7 text-text">
              {{ t.quote }}
            </p>

            <footer class="mt-5 flex flex-wrap items-center gap-3 border-t border-primary/12 pt-4">
              <!-- optional image / avatar -->
              <img
                v-if="t.image"
                :src="assetUrl(t.image)"
                :alt="t.name"
                class="h-9 w-9 rounded-full object-cover ring-1 ring-primary/20"
                loading="lazy"
                decoding="async"
              />
              <span class="font-semibold text-text">{{ t.name }}</span>
              <span
                v-if="t.subject"
                class="rounded-full bg-primary/15 px-3 py-1 text-xs uppercase tracking-[0.2em] text-accent"
              >{{ t.subject }}</span>
            </footer>
          </article>
        </div>

        <div
          v-else-if="!testimonialsError"
          class="rounded-2xl border border-dashed border-primary/25 px-6 py-10 text-center text-text/80"
        >
          {{ cms?.empty_state }}
        </div>
      </section>

      <!-- Right: submission form (sticky on desktop) -->
      <aside class="rounded-[1.75rem] border border-primary/20 bg-primary/8 p-6 shadow-lg shadow-black/20 lg:sticky lg:top-28">
        <div class="space-y-2">
          <TypographyTitle as="p">{{ cms?.form_eyebrow }}</TypographyTitle>
          <TypographyHeadline as="h2" size="md" :content="cms?.form_headline ?? ''" />
          <p class="pt-1 text-sm leading-6 text-text/85">{{ cms?.form_description }}</p>
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="submitTestimonial" novalidate>
          <label class="block space-y-1.5">
            <span class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Your name</span>
            <input
              v-model="form.name"
              type="text"
              maxlength="80"
              autocomplete="name"
              class="w-full rounded-xl border border-primary/20 bg-background px-4 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text/45 focus:border-accent"
              :placeholder="cms?.placeholder_name ?? 'How should we credit you?'"
            >
          </label>

          <label class="block space-y-1.5">
            <span class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">In a nutshell</span>
            <input
              v-model="form.subject"
              type="text"
              maxlength="120"
              class="w-full rounded-xl border border-primary/20 bg-background px-4 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text/45 focus:border-accent"
              :placeholder="cms?.placeholder_subject ?? 'One line that captures it'"
            >
          </label>

          <label class="block space-y-1.5">
            <span class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Say it</span>
            <textarea
              v-model="form.quote"
              rows="6"
              maxlength="2000"
              class="w-full resize-none rounded-xl border border-primary/20 bg-background px-4 py-2.5 text-sm leading-7 text-text outline-none transition-colors placeholder:text-text/45 focus:border-accent"
              :placeholder="cms?.placeholder_quote ?? 'Write it however feels right.'"
            />
          </label>

          <p
            v-if="submitError"
            class="rounded-xl bg-red-500/12 px-4 py-3 text-sm text-red-200"
          >
            {{ submitError }}
          </p>

          <div
            v-if="submitSuccess"
            class="space-y-1 rounded-xl bg-emerald-500/12 px-4 py-3"
          >
            <p class="text-sm font-medium text-emerald-200">Sent!</p>
            <p class="text-sm text-emerald-200/80">{{ submitSuccess }}</p>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span v-if="isSubmitting" class="i-material-symbols-progress-activity animate-spin text-base" />
            {{ isSubmitting ? 'Sending…' : 'Submit' }}
          </button>
        </form>
      </aside>

    </div>
  </BlockContainer>
</template>