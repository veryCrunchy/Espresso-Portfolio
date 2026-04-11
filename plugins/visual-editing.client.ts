import { apply } from '@directus/visual-editing';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  apply({ directusUrl: config.public.directusUrl });
});
