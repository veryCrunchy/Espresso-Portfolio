import { useRuntimeConfig } from "#imports";
import type { File } from "~/types";

export default function useFile(fileId: string | File) {
  const config = useRuntimeConfig();

  if (!fileId) return undefined;

  if (typeof fileId === "string") {
    return `${config.public.directusUrl}/assets/${fileId}`;
  }

  // Handle case where fileId is an object<File>
  if (fileId as File) {
    return `${config.public.directusUrl}/assets/${(fileId as File).id}`;
  }

  return undefined;
}
