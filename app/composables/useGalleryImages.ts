import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useState } from 'nuxt/app';
import type { BlockGallery, File } from '#shared/types';

/**
 * The gallery's images, shuffled when `random_order` is on. The shuffle happens once on
 * the server and is reused when hydrating — shuffling inside a computed would produce a
 * different order on the client and make the grid jump.
 */
export function useGalleryImages(gallery: MaybeRefOrGetter<BlockGallery>) {
  const files = computed(() =>
    (toValue(gallery).images ?? [])
      .map((item) => item.directus_files_id)
      .filter((file): file is File => !!file && typeof file === 'object'),
  );

  const order = useState<string[] | null>(`gallery-order:${toValue(gallery).id}`, () => {
    if (!toValue(gallery).random_order) return null;
    const ids = files.value.map((f) => f.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    }
    return ids;
  });

  return computed(() => {
    if (!order.value) return files.value;
    const rank = new Map(order.value.map((id, i) => [id, i]));
    return [...files.value].sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
  });
}
