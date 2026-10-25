// Directus visual editing only matters when the site is framed by the CMS editor,
// so regular visitors never download or run it.
export default defineNuxtPlugin((nuxtApp) => {
  if (window.self === window.top) return;

  const config = useRuntimeConfig();
  const framed = useState('cms-framed', () => false);
  framed.value = true; // also switches CMS fetches to uncached preview mode

  async function init() {
    const { apply, remove } = await import('@directus/visual-editing');
    remove();
    await apply({
      directusUrl: config.public.directusUrl,
      onSaved: () => refreshNuxtData(),
    });
  }

  nuxtApp.hook('app:mounted', init);
  nuxtApp.hook('page:finish', init);
});
