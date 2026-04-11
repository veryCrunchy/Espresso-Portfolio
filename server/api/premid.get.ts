import { getPreMIDActivity } from '../utils/premid-store';

export default defineEventHandler(() => {
  return { activity: getPreMIDActivity() };
});
