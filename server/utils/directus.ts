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

/**
 * What a CMS preview request may see. Drafts and unsaved content versions are only shown
 * when the request carries the preview secret (`?token=` in the Directus preview URL).
 */
export function previewAccess(event: H3Event) {
  const { previewSecret } = useRuntimeConfig();
  const query = getQuery(event);
  const drafts = isPreview(event) && !!previewSecret && query.token === previewSecret;
  const version = drafts && typeof query.version === 'string' && query.version && query.version !== 'main' ? query.version : undefined;
  return { drafts, version };
}

type CmsResult<T> = { value: T } | { error: { statusCode: number; statusMessage?: string } };

/**
 * Cached CMS handler: serves stale content while revalidating in the background.
 *
 * "Not found"-style errors are cached as results rather than thrown: Nitro keeps serving
 * the stale entry when a background refresh throws, so an unpublished or deleted item
 * would otherwise stay online forever. Server errors still throw, which keeps the last
 * good content up while the CMS is unreachable.
 */
export function defineCmsHandler<T>(handler: (event: H3Event) => Promise<T>, maxAge = 60) {
  const resolve = async (event: H3Event): Promise<CmsResult<T>> => {
    try {
      return { value: await handler(event) };
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode && statusCode >= 400 && statusCode < 500) {
        return { error: { statusCode, statusMessage: (error as { statusMessage?: string }).statusMessage } };
      }
      throw error;
    }
  };

  const cached = defineCachedFunction(resolve, {
    maxAge,
    swr: true,
    name: 'cms',
    // Cache storage drops everything after "?" in keys, so encode the full path.
    getKey: (event: H3Event) => encodeURIComponent(event.path),
  });

  return defineEventHandler(async (event) => {
    // Previews always hit the CMS (and may see drafts), so they never touch the cache.
    const result = isPreview(event) ? await resolve(event) : await cached(event);
    if ('error' in result) throw createError(result.error);
    return result.value;
  });
}
