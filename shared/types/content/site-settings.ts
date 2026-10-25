import type { File } from '../system';
import type { DesignSettings } from './design';

export interface NavItem {
  label: string
  url: string
}

export interface SiteSettings extends DesignSettings {
  id: number
  color_text: string
  color_background: string
  color_primary: string
  color_secondary: string
  color_accent: string
  site_name?: string | null
  site_description?: string | null
  og_image?: string | File | null
  twitter_handle?: string | null
  navigation?: NavItem[] | null
  footer_text?: string | null
}
