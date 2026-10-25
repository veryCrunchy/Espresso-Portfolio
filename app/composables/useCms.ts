import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useFetch, useRoute, useRuntimeConfig, useState, type AsyncData, type NuxtError, type UseFetchOptions } from 'nuxt/app';
import type { File, Link, SiteSettings } from '#shared/types';

/**
 * True when the site is opened from the CMS (`?preview=true`, or framed by the Directus
 * visual editor). Preview requests bypass the server-side response cache.
 */
export function useCmsPreview() {
  const route = useRoute();
  const framed = useState('cms-framed', () => false);
  return computed(() => framed.value || route.query.preview === 'true');
}

/** `useFetch` for the CMS API routes, adding `?preview=true` while previewing. */
export function useCmsFetch<T>(
  url: string | (() => string),
  options: Omit<UseFetchOptions<T, T>, 'query' | 'default'> & {
    query?: MaybeRefOrGetter<Record<string, unknown>>;
    default?: () => T;
  } = {},
) {
  const preview = useCmsPreview();
  const { query, ...rest } = options;
  return useFetch(url, {
    ...rest,
    query: computed(() => ({
      ...toValue(query),
      ...(preview.value ? { preview: 'true' } : {}),
    })),
  } as never) as unknown as AsyncData<T | undefined, NuxtError | undefined>;
}

export const DEFAULT_THEME: SiteSettings = {
  id: 0,
  color_text: '#FEFFC2',
  color_background: '#130C0B',
  color_primary: '#675537',
  color_secondary: '#87B087',
  color_accent: '#87B087',
  site_name: "Espresso's Work",
};

export function useSiteSettings() {
  return useCmsFetch<SiteSettings>('/api/site-settings', {
    key: 'site-settings',
    default: () => DEFAULT_THEME,
  });
}

export function useLinks() {
  return useCmsFetch<Link[]>('/api/links', { key: 'links', default: () => [] });
}

/** Directus file id from either an id or an expanded file object. */
export function fileId(file: string | Partial<File> | null | undefined) {
  if (!file) return undefined;
  return typeof file === 'string' ? file : file.id;
}

/** Returns a builder for absolute asset URLs (meta tags, plain <img>). Call during setup. */
export function useAssetUrl() {
  const base = useRuntimeConfig().public.directusUrl.replace(/\/$/, '');
  return (file: string | Partial<File> | null | undefined, params?: Record<string, string | number>) => {
    const id = fileId(file);
    if (!id) return undefined;
    const query = params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])) : '';
    return `${base}/assets/${id}${query}`;
  };
}

/** CSS object-position from a Directus focal point. */
export function focalPosition(file: Partial<File> | string | null | undefined) {
  if (!file || typeof file === 'string') return undefined;
  const { focal_point_x: x, focal_point_y: y, width, height } = file;
  if (x == null || y == null || !width || !height) return undefined;
  return { objectPosition: `${(x / width) * 100}% ${(y / height) * 100}%` };
}

const BRANDS: [RegExp, string][] = [
  [/youtube\.com|youtu\.be/, 'simple-icons:youtube'],
  [/(^|\.)x\.com|twitter\.com/, 'simple-icons:x'],
  [/linkedin\.com/, 'simple-icons:linkedin'],
  [/github\.com/, 'simple-icons:github'],
  [/instagram\.com/, 'simple-icons:instagram'],
  [/threads\.(net|com)/, 'simple-icons:threads'],
  [/twitch\.tv/, 'simple-icons:twitch'],
  [/music\.apple\.com/, 'simple-icons:applemusic'],
  [/ko-fi\.com/, 'simple-icons:kofi'],
  [/linktr\.ee/, 'simple-icons:linktree'],
  [/tiktok\.com/, 'simple-icons:tiktok'],
  [/bsky\.app/, 'simple-icons:bluesky'],
  [/artstation\.com/, 'simple-icons:artstation'],
  [/behance\.net/, 'simple-icons:behance'],
  [/quora\.com/, 'simple-icons:quora'],
  [/spotify\.com/, 'simple-icons:spotify'],
  [/soundcloud\.com/, 'simple-icons:soundcloud'],
  [/discord\.(gg|com)/, 'simple-icons:discord'],
  [/patreon\.com/, 'simple-icons:patreon'],
  [/reddit\.com/, 'simple-icons:reddit'],
  [/facebook\.com/, 'simple-icons:facebook'],
  [/vimeo\.com/, 'simple-icons:vimeo'],
  [/sketchfab\.com/, 'simple-icons:sketchfab'],
  [/^mailto:/, 'material-symbols:mail-rounded'],
];

/** Iconify name for a link: explicit CMS icon, else detected from the URL. */
export function linkIcon(link: Pick<Link, 'url' | 'icon'>) {
  if (link.icon) return link.icon.includes(':') ? link.icon : `simple-icons:${link.icon}`;
  let host = link.url;
  try {
    host = new URL(link.url).hostname;
  } catch {}
  return BRANDS.find(([re]) => re.test(host) || re.test(link.url))?.[1] ?? 'material-symbols:link-rounded';
}
