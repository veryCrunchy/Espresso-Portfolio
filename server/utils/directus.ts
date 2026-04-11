import { createDirectus, rest, staticToken } from '@directus/sdk';
import type { Schema } from '~/types/schema';

export function createServerDirectus() {
  const config = useRuntimeConfig();

  if (!config.public.directusUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'NUXT_PUBLIC_DIRECTUS_URL is not configured.',
    });
  }

  if (config.directusToken) {
    return createDirectus<Schema>(config.public.directusUrl)
      .with(staticToken(config.directusToken))
      .with(rest({ credentials: 'include' }));
  }

  return createDirectus<Schema>(config.public.directusUrl).with(
    rest({ credentials: 'include' })
  );
}