import { apply, remove } from '@directus/visual-editing';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  async function init() {
    remove();
    await apply({ directusUrl: config.public.directusUrl });
  }

  nuxtApp.hook('app:mounted', init);
  nuxtApp.hook('page:finish', init);
});
