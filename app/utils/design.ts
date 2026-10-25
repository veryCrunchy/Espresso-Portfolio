import design from '~~/shared/design.json';
import type { DesignSettings } from '#shared/types';

const FALLBACKS: Record<string, string> = {
  Sans: 'ui-sans-serif, system-ui, sans-serif',
  Serif: 'Georgia, ui-serif, serif',
  Display: 'Impact, ui-sans-serif, sans-serif',
  Mono: 'ui-monospace, monospace',
  Handwriting: 'cursive',
};

const DESIGN_KEYS: (keyof DesignSettings)[] = [
  'color_text', 'color_background', 'color_primary', 'color_secondary', 'color_accent',
  'text_scale', 'heading_scale', 'spacing_scale', 'radius_scale',
  'heading_font', 'body_font', 'content_width',
];

function fontStack(name: string | null | undefined) {
  const font = design.fonts.find((f) => f.name === name);
  return font ? `"${font.name}", ${FALLBACKS[font.kind] ?? 'sans-serif'}` : undefined;
}

/** CMS values end up inside a <style> tag; never let one break out of its declaration. */
function safe(value: string | null | undefined) {
  return value?.replace(/[;{}<>\\]/g, '').trim() || undefined;
}

function percent(value: number | null | undefined, min: number, max: number) {
  return value == null ? undefined : String(Math.min(Math.max(value, min), max) / 100);
}

/** CSS custom properties for the settings that are set (unset ones inherit). */
export function designVars(d: DesignSettings | null | undefined): Record<string, string> {
  if (!d) return {};
  const vars: Record<string, string | undefined> = {
    '--color-text': safe(d.color_text),
    '--color-background': safe(d.color_background),
    '--color-primary': safe(d.color_primary),
    '--color-secondary': safe(d.color_secondary),
    '--color-accent': safe(d.color_accent),
    '--text-scale': percent(d.text_scale, 50, 200),
    '--heading-scale': percent(d.heading_scale, 30, 200),
    '--space-scale': percent(d.spacing_scale, 30, 200),
    '--radius-scale': percent(d.radius_scale, 0, 300),
    '--font-heading': fontStack(d.heading_font),
    '--font-body': fontStack(d.body_font),
    '--content-width': d.content_width ? (design.contentWidths as Record<string, string>)[d.content_width] : undefined,
  };
  return Object.fromEntries(Object.entries(vars).filter((entry): entry is [string, string] => !!entry[1]));
}

export function designCss(vars: Record<string, string>) {
  const lines = Object.entries(vars).map(([name, value]) => `  ${name}: ${value};`);
  return lines.length ? `:root {\n${lines.join('\n')}\n}` : '';
}

/** Later sources win; empty values fall through to earlier ones. */
export function mergeDesign(...sources: (DesignSettings | null | undefined)[]): DesignSettings {
  const result: DesignSettings = {};
  for (const source of sources) {
    for (const key of DESIGN_KEYS) {
      const value = source?.[key];
      if (value != null && value !== '') (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}
