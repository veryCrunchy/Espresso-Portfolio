import type { DesignSettings } from './design';

export interface Link {
  id: number
  status: 'published' | 'draft'
  sort: number | null
  title: string
  url: string
  open_new_tab: boolean
  image: string | { id: string; filename_download: string } | null
  /** Optional Iconify name (e.g. "simple-icons:youtube") — auto-detected from the URL when empty. */
  icon?: string | null
  description?: string | null
}

export interface LinksPage extends DesignSettings {
  id: number
  headline: string
  description: string | null
}
