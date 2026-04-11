import { isDirectusError, readItems } from '@directus/sdk';
import type { Testimonial } from '~/types';
import { createServerDirectus } from '../utils/directus';

export default defineEventHandler(async () => {
  const directus = createServerDirectus();

  try {
    return await directus.request(
      readItems('testimonials', {
        fields: ['id', 'name', 'subject', 'quote', 'status', 'date_created', 'image'],
        filter: {
          status: {
            _eq: 'published',
          },
        },
        sort: ['-date_created'],
      })
    );
  } catch (error) {
    if (isDirectusError(error)) {
      throw createError({
        statusCode: 500,
        statusMessage:
          'Unable to load testimonials from Directus. Confirm the testimonials collection exists and published items are readable.',
        data: error.errors,
      });
    }

    throw error;
  }
});