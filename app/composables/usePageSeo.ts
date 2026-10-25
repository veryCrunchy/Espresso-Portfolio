import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useHead, useRoute, useRuntimeConfig, useSeoMeta } from 'nuxt/app';
import { joinURL, withoutTrailingSlash } from 'ufo';
import { useAssetUrl, useCmsPreview, useSiteSettings } from './useCms';
import type { File } from '#shared/types';

interface PageSeo {
  title?: string | null;
  description?: string | null;
  image?: string | Partial<File> | null;
  type?: 'website' | 'article';
  noindex?: boolean;
}

function plain(value?: string | null) {
  return value?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || undefined;
}

/**
 * Title, description, canonical URL, Open Graph and Twitter card tags.
 * Falls back to the site-wide settings from the CMS.
 */
export function usePageSeo(input: MaybeRefOrGetter<PageSeo>) {
  const route = useRoute();
  const { siteUrl } = useRuntimeConfig().public;
  const { data: settings } = useSiteSettings();
  const assetUrl = useAssetUrl();
  const preview = useCmsPreview();

  const seo = computed(() => toValue(input));
  const siteName = computed(() => settings.value?.site_name || "Espresso's Work");
  const description = computed(
    () => plain(seo.value.description)?.slice(0, 300) || settings.value?.site_description || undefined,
  );
  const image = computed(() => {
    const img = seo.value.image ?? settings.value?.og_image;
    if (typeof img === 'string' && /^https?:/.test(img)) return img;
    return assetUrl(img, { width: 1200, height: 630, fit: 'cover', format: 'jpg', quality: 80 });
  });
  const canonical = computed(() => withoutTrailingSlash(joinURL(siteUrl, route.path)) || siteUrl);

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
  });

  useSeoMeta({
    title: () => plain(seo.value.title),
    description,
    ogTitle: () => plain(seo.value.title) ?? siteName.value,
    ogDescription: description,
    ogType: () => seo.value.type ?? 'website',
    ogUrl: canonical,
    ogSiteName: siteName,
    ogImage: image,
    twitterCard: () => (image.value ? 'summary_large_image' : 'summary'),
    twitterSite: () => settings.value?.twitter_handle || undefined,
    twitterCreator: () => settings.value?.twitter_handle || undefined,
    robots: () => (seo.value.noindex || preview.value ? 'noindex, nofollow' : undefined),
  });
}
