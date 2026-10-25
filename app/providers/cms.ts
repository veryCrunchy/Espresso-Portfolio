import directus from "@nuxt/image/runtime/providers/directus";
import { defineProvider } from "@nuxt/image/runtime";
import { joinURL } from "ufo";

// Wraps the built-in Directus provider so the asset base URL comes from
// runtime config (NUXT_PUBLIC_DIRECTUS_URL) instead of being baked in at build time.
export default defineProvider({
  getImage(src, options, ctx) {
    if (/^https?:\/\//.test(src)) return { url: src };
    const runtimeConfig = (ctx.options as { runtimeConfig?: { public: { directusUrl: string } } }).runtimeConfig;
    const directusUrl = runtimeConfig?.public.directusUrl ?? "";
    // `auto` lets Directus pick AVIF/WebP based on the browser's Accept header.
    const given = Object.fromEntries(Object.entries(options.modifiers ?? {}).filter(([, v]) => v !== undefined));
    const modifiers = { format: "auto", quality: 78, ...given };
    return directus().getImage(src, { ...options, modifiers, baseURL: joinURL(directusUrl, "assets") }, ctx);
  },
});
