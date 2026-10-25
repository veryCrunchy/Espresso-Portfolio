/**
 * Look & feel settings. Site settings hold the defaults; pages, posts and the
 * links/testimonials pages can override any of them (empty = inherit).
 */
export interface DesignSettings {
  color_text?: string | null;
  color_background?: string | null;
  color_primary?: string | null;
  color_secondary?: string | null;
  color_accent?: string | null;
  /** Percentages, 100 = default. */
  text_scale?: number | null;
  heading_scale?: number | null;
  spacing_scale?: number | null;
  radius_scale?: number | null;
  heading_font?: string | null;
  body_font?: string | null;
  content_width?: 'narrow' | 'default' | 'wide' | 'full' | null;
}
