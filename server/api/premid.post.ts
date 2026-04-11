import type { PreMIDPayload } from '~/types/premid';
import { setPreMIDActivity } from '../utils/premid-store';

export default defineEventHandler(async (event) => {
  const body = await readBody<PreMIDPayload>(event);

  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload.' });
  }

  setPreMIDActivity(body.active_activity ?? null);

  return { ok: true };
});
