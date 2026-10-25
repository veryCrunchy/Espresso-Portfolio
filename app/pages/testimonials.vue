<script setup lang="ts">
import type { Testimonial, TestimonialsPage, TestimonialSubmission } from '#shared/types';

const [{ data: cms }, { data: testimonials, error: testimonialsError, pending }] = await Promise.all([
  useCmsFetch<TestimonialsPage>('/api/testimonials-page', { key: 'testimonials-page' }),
  useCmsFetch<Testimonial[]>('/api/testimonials', { key: 'published-testimonials' }),
]);

usePageSeo(() => ({
  title: cms.value?.eyebrow ?? 'Testimonials',
  description: cms.value?.description,
}));

const assetUrl = useAssetUrl();

function avatar(t: Testimonial) {
  return t.image_url || assetUrl(t.image, { width: 96, height: 96, fit: 'cover', format: 'webp' });
}

const LIMITS = { name: 80, subject: 120, quote: 2000 } as const;

const form = reactive<TestimonialSubmission>({ name: '', subject: '', quote: '', image_url: '', website: '' });
const submitError = ref('');
const submitSuccess = ref('');
const isSubmitting = ref(false);

const imagePreviewOk = ref(true);
watch(() => form.image_url, () => (imagePreviewOk.value = true));
const imagePreview = computed(() => (/^https?:\/\/\S+$/.test(form.image_url ?? '') ? form.image_url : ''));

async function submitTestimonial() {
  submitError.value = '';
  submitSuccess.value = '';

  if (!form.name.trim() || !form.subject.trim() || !form.quote.trim()) {
    submitError.value = 'Please fill in your name, a one-liner, and your testimonial.';
    return;
  }

  isSubmitting.value = true;

  try {
    await $fetch('/api/testimonials', { method: 'POST', body: form });
    Object.assign(form, { name: '', subject: '', quote: '', image_url: '' });
    submitSuccess.value = cms.value?.success_message ?? 'Submitted — pending approval.';
  } catch (err) {
    const e = err as { data?: { statusMessage?: string; message?: string } };
    submitError.value = e.data?.statusMessage || e.data?.message || 'Something went wrong — try again in a moment.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <BlockContainer class="py-10 lg:py-20">
    <div class="mb-12 max-w-2xl space-y-4">
      <TypographyTitle as="p">{{ cms?.eyebrow }}</TypographyTitle>
      <TypographyHeadline as="h1" size="title" :content="cms?.headline ?? ''" />
      <p class="whitespace-pre-line text-lg leading-8 text-text/90">{{ cms?.description }}</p>
    </div>

    <div class="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
      <section aria-label="Testimonials">
        <div v-if="pending && !testimonials?.length" class="grid gap-4">
          <div v-for="i in 3" :key="i" class="h-36 animate-pulse rounded-2xl bg-primary/10" />
        </div>

        <div v-else-if="testimonials?.length" class="grid gap-5">
          <figure
            v-for="t in testimonials"
            :key="t.id"
            class="group relative rounded-2xl border border-primary/15 bg-primary/8 p-6 transition-colors hover:border-primary/30 hover:bg-primary/12"
          >
            <span aria-hidden="true" class="absolute right-5 top-3 select-none font-serif text-6xl leading-none text-primary/30">"</span>

            <blockquote class="relative z-1 whitespace-pre-line text-base leading-7 text-text">{{ t.quote }}</blockquote>

            <figcaption class="mt-5 flex flex-wrap items-center gap-3 border-t border-primary/15 pt-4">
              <img
                v-if="avatar(t)"
                :src="avatar(t)"
                :alt="''"
                class="size-9 rounded-full object-cover ring-1 ring-primary/25"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              >
              <span class="font-semibold text-text">{{ t.name }}</span>
              <span v-if="t.subject" class="rounded-full bg-primary/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-accent">
                {{ t.subject }}
              </span>
              <time v-if="t.date_created" :datetime="t.date_created" class="ml-auto text-xs text-text/45">
                {{ formatDate(t.date_created) }}
              </time>
            </figcaption>
          </figure>
        </div>

        <div
          v-else-if="!testimonialsError"
          class="rounded-2xl border border-dashed border-primary/25 px-6 py-10 text-center text-text/80"
        >
          {{ cms?.empty_state }}
        </div>
      </section>

      <aside class="rounded-[1.75rem] border border-primary/20 bg-primary/10 p-6 shadow-lg shadow-black/20 lg:sticky lg:top-24">
        <div class="space-y-2">
          <TypographyTitle as="p">{{ cms?.form_eyebrow }}</TypographyTitle>
          <TypographyHeadline as="h2" size="md" :content="cms?.form_headline ?? ''" />
          <p class="pt-1 text-sm leading-6 text-text/85">{{ cms?.form_description }}</p>
        </div>

        <form class="mt-6 space-y-4" novalidate @submit.prevent="submitTestimonial">
          <!-- Honeypot: hidden from people, irresistible to bots -->
          <div class="absolute -left-[9999px] size-px overflow-hidden" aria-hidden="true">
            <label>Website <input v-model="form.website" type="text" tabindex="-1" autocomplete="off"></label>
          </div>

          <label class="block space-y-1.5">
            <span class="flex justify-between text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Your name
            </span>
            <input
              v-model="form.name"
              type="text"
              required
              :maxlength="LIMITS.name"
              autocomplete="name"
              class="field"
              :placeholder="cms?.placeholder_name ?? 'How should we credit you?'"
            >
          </label>

          <label class="block space-y-1.5">
            <span class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">In a nutshell</span>
            <input
              v-model="form.subject"
              type="text"
              required
              :maxlength="LIMITS.subject"
              class="field"
              :placeholder="cms?.placeholder_subject ?? 'One line that captures it'"
            >
          </label>

          <label class="block space-y-1.5">
            <span class="flex justify-between text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Say it
              <span class="font-normal normal-case tracking-normal tabular-nums text-text/45">{{ form.quote.length }} / {{ LIMITS.quote }}</span>
            </span>
            <textarea
              v-model="form.quote"
              rows="6"
              required
              :maxlength="LIMITS.quote"
              class="field resize-y leading-7"
              :placeholder="cms?.placeholder_quote ?? 'Write it however feels right.'"
            />
          </label>

          <label class="block space-y-1.5">
            <span class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Add an image <span class="font-normal normal-case tracking-normal text-text/50">(optional — go wild)</span>
            </span>
            <input v-model="form.image_url" type="url" maxlength="500" class="field" placeholder="https://example.com/image.gif">
            <p class="text-xs text-text/50">
              Needs to be a direct image URL — on Tenor, right-click the GIF and choose <em>Copy image address</em>.
            </p>
            <img
              v-if="imagePreview && imagePreviewOk"
              :src="imagePreview"
              alt="Image preview"
              class="mt-2 max-h-32 rounded-xl ring-1 ring-primary/25"
              referrerpolicy="no-referrer"
              @error="imagePreviewOk = false"
            >
            <p v-else-if="imagePreview" class="text-xs text-red-300">That link doesn't look like an image.</p>
          </label>

          <p v-if="submitError" role="alert" class="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
            {{ submitError }}
          </p>

          <div v-if="submitSuccess" role="status" class="space-y-1 rounded-xl bg-emerald-500/15 px-4 py-3">
            <p class="text-sm font-medium text-emerald-200">Sent!</p>
            <p class="text-sm text-emerald-200/80">{{ submitSuccess }}</p>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon v-if="isSubmitting" name="material-symbols:progress-activity" class="size-4 animate-spin" />
            {{ isSubmitting ? 'Sending…' : 'Submit' }}
          </button>
        </form>
      </aside>
    </div>
  </BlockContainer>
</template>

<style scoped>
.field {
  --uno: w-full rounded-xl border border-primary/25 bg-background px-4 py-2.5 text-sm text-text outline-none transition-colors;
  --uno: placeholder:text-text/45 focus:border-accent;
}
</style>
