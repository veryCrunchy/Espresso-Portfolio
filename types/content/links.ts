export interface Link {
  id: number
  status: 'published' | 'draft'
  sort: number | null
  title: string
  url: string
  open_new_tab: boolean
  image: string | { id: string; filename_download: string } | null
}

export interface LinksPage {
  id: number
  headline: string
  description: string | null
}
