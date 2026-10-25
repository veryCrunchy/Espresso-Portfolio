import {
  defineConfig,
  presetTypography,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  theme: {
    font: {
      sans: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
    // Theme colors come from the CMS as CSS variables. presetWind4 applies
    // opacity modifiers (bg-primary/10) via color-mix, so any CSS color works.
    colors: {
      text: "var(--color-text)",
      background: "var(--color-background)",
      primary: "var(--color-primary)",
      secondary: "var(--color-secondary)",
      accent: "var(--color-accent)",
    },
  },
  presets: [presetWind4({ preflights: { reset: true } }), presetTypography()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
