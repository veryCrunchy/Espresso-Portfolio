import { toValue, type MaybeRefOrGetter } from 'vue';
import { useHead } from 'nuxt/app';
import type { DesignSettings } from '#shared/types';

/**
 * Per-page design overrides (colors, sizes, fonts, width) from the CMS.
 * Only injects a style tag when the page actually overrides something.
 */
export function usePageTheme(page: MaybeRefOrGetter<DesignSettings | null | undefined>) {
  useHead(() => {
    const css = designCss(designVars(toValue(page)));
    // Rendered after the site-wide theme so page values win.
    return css ? { style: [{ key: 'page-theme', innerHTML: css, tagPriority: 'low' }] } : {};
  });
}
