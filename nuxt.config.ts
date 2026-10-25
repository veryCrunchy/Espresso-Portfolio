// https://nuxt.com/docs/api/configuration/nuxt-config
import design from "./shared/design.json";

export default defineNuxtConfig({
  compatibilityDate: "2026-10-01",
  devtools: { enabled: true },

  runtimeConfig: {
    directusToken: "",
    // Shared secret the PreMID extension must send (Bearer header or ?token=).
    // Leave empty to accept unauthenticated updates (not recommended).
    premidSecret: "",
    // Secret in the Directus preview URLs (?token=) that unlocks drafts and content versions.
    previewSecret: "",
    public: {
      directusUrl: "https://cms.espressos.work",
      // Used for canonical URLs, sitemap and RSS — override with NUXT_PUBLIC_SITE_URL locally.
      siteUrl: "https://espressos.work",
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      meta: [{ name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" }],
      link: [
        { rel: "icon", href: "/favicon.ico" },
        { rel: "alternate", type: "application/rss+xml", title: "Blog RSS", href: "/rss.xml" },
      ],
    },
    pageTransition: { name: "page", mode: "out-in" },
  },

  css: ["~/assets/main.css"],

  components: [
    { path: "~/components/base", pathPrefix: false },
    "~/components",
  ],

  modules: ["@unocss/nuxt", "@nuxt/image", "@nuxt/fonts", "@nuxt/icon"],

  image: {
    // Directus serves resized/re-encoded assets; the provider reads the CMS URL at runtime.
    provider: "cms",
    providers: {
      cms: { provider: "~/providers/cms.ts" },
    },
    screens: { xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536, "2xl": 1920 },
  },

  icon: {
    // Bundle only the icons referenced in app/ (incl. the brand map in useCms.ts).
    // Custom icon names typed into the CMS are fetched from Iconify on demand.
    clientBundle: { scan: { globInclude: ["app/**/*.{vue,ts}"] } },
    serverBundle: "remote",
  },

  fonts: {
    // Every font offered in the CMS "Design" settings. Only fonts a page uses get downloaded by visitors.
    families: design.fonts.map((f) => ({ name: f.name, provider: "google", weights: [400, 500, 600, 700], global: true })),
  },

  routeRules: {
    "/**": {
      headers: {
        "Content-Security-Policy": "frame-ancestors 'self' https://cms.espressos.work",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Content-Type-Options": "nosniff",
      },
    },
    "/testimomial": { redirect: { to: "/testimonials", statusCode: 301 } },
    "/social": { redirect: { to: "/links", statusCode: 302 } },
    "/_nuxt/**": { headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  },
});
