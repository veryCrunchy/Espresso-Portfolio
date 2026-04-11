import { createItem, isDirectusError } from '@directus/sdk';
import type { TestimonialSubmission } from '~/types';
import { createServerDirectus } from '../utils/directus';

function normalizeField(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export default defineEventHandler(async (event) => {
  const body = await readBody<TestimonialSubmission>(event);
  const name = normalizeField(body?.name, 80);
  const subject = normalizeField(body?.subject, 120);
  const quote = normalizeField(body?.quote, 2000);
  const image_url = normalizeField(body?.image_url, 500) || undefined;

  if (!name || !subject || !quote) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name, subject, and quote are all required.',
    });
  }

  const directus = createServerDirectus();

  try {
    return await directus.request(
      createItem('testimonials', {
        name,
        quote,
        status: 'draft',
        subject,
        image_url,
      })
    );
  } catch (error) {
    if (isDirectusError(error)) {
      throw createError({
        statusCode: 500,
        statusMessage:
          'Unable to submit testimonial to Directus. Check collection permissions or configure NUXT_DIRECTUS_TOKEN for server-side writes.',
        data: error.errors,
      });
    }

    throw error;
  }
});