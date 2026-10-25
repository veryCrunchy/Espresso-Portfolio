import { readItems } from '@directus/sdk';
import type { Link } from '#shared/types';

export default defineCmsHandler(async () => {
  const directus = createServerDirectus();

  try {
    return (await directus.request(
      readItems('links', {
        filter: { status: { _eq: 'published' } },
        sort: ['sort'],
        fields: ['id', 'title', 'url', 'open_new_tab', 'image', 'icon', 'description'],
      }),
    )) as Link[];
  } catch (error) {
    toCmsError(error, 'Unable to load links from Directus.');
  }
});
