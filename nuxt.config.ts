// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: [
    "@unocss/reset/normalize.css",
    "@unocss/reset/sanitize/sanitize.css",
    "@unocss/reset/sanitize/assets.css",
    "@unocss/reset/eric-meyer.css",
    "@unocss/reset/tailwind.css",
  ],
  runtimeConfig: {
    public: {
      directusUrl: "",
    },
  },

  components: [
    { path: "~/components/base", pathPrefix: false },
    "~/components",
  ],

  modules: [
    "@unocss/nuxt",
    "@nuxt/image",
    "@nuxt/fonts",
    "@nuxt/icon",
    // "@nuxt/ui",
  ],
});
