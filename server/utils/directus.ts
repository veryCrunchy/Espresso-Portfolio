import { createDirectus, isDirectusError, rest, staticToken } from '@directus/sdk';
import type { H3Event } from 'h3';
import type { Schema } from '#shared/types/schema';

let client: ReturnType<typeof buildClient> | undefined;

function buildClient(url: string, token: string) {
  const base = createDirectus<Schema>(url);
  return token ? base.with(staticToken(token)).with(rest()) : base.with(rest());
}

export function createServerDirectus() {
  const config = useRuntimeConfig();

  if (!config.public.directusUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'NUXT_PUBLIC_DIRECTUS_URL is not configured.',
    });
  }

  client ??= buildClient(config.public.directusUrl, config.directusToken);
  return client;
}

/**
 * Directus answers FORBIDDEN both for missing permissions and for collections/fields
 * that do not exist yet. Used to degrade gracefully before the CMS schema is set up.
 */
export function isMissingInCms(error: unknown) {
  return isDirectusError(error) && error.errors.some((e) => e.extensions?.code === 'FORBIDDEN');
}

export function toCmsError(error: unknown, message: string): never {
  if (isDirectusError(error)) {
    throw createError({ statusCode: 502, statusMessage: message, data: error.errors });
  }
  throw error;
}

/** Preview requests (`?preview=true`) skip the response cache so CMS edits show up immediately. */
export function isPreview(event: H3Event) {
  const query = getQuery(event);
  return query.preview === 'true' || query.preview === '1';
}

/** Cached CMS handler: serves stale content while revalidating in the background. */
export function defineCmsHandler<T>(handler: (event: H3Event) => Promise<T>, maxAge = 60) {
  return defineCachedEventHandler(handler, {
    maxAge,
    swr: true,
    name: 'cms',
    getKey: (event) => event.path.replace(/[?&]preview=[^&]*/, ''),
    shouldBypassCache: isPreview,
  });
}
