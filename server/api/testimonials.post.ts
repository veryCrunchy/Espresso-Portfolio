import { createItem } from '@directus/sdk';
import type { TestimonialSubmission } from '#shared/types';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const submissions = new Map<string, number[]>();

function normalizeField(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function normalizeImageUrl(value: unknown) {
  const raw = normalizeField(value, 500);
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (submissions.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  submissions.set(ip, recent);
  return false;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<TestimonialSubmission>(event);

  // Honeypot: bots fill every field. Pretend it worked.
  if (normalizeField(body?.website, 200)) return { ok: true };

  const name = normalizeField(body?.name, 80);
  const subject = normalizeField(body?.subject, 120);
  const quote = normalizeField(body?.quote, 2000);
  const image_url = normalizeImageUrl(body?.image_url);

  if (!name || !subject || !quote) {
    throw createError({ statusCode: 400, statusMessage: 'Name, subject, and quote are all required.' });
  }

  if (normalizeField(body?.image_url, 500) && !image_url) {
    throw createError({ statusCode: 400, statusMessage: 'The image needs to be a valid http(s) URL.' });
  }

  if (isRateLimited(getRequestIP(event, { xForwardedFor: true }) ?? 'unknown')) {
    throw createError({ statusCode: 429, statusMessage: 'Too many submissions — try again in a few minutes.' });
  }

  const directus = createServerDirectus();

  try {
    await directus.request(createItem('testimonials', { name, quote, status: 'draft', subject, image_url }));
    return { ok: true };
  } catch (error) {
    toCmsError(
      error,
      'Unable to submit testimonial to Directus. Check collection permissions or configure NUXT_DIRECTUS_TOKEN for server-side writes.',
    );
  }
});
