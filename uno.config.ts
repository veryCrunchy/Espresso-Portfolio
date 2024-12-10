import {
  defineConfig,
  transformerDirectives,
  presetTypography,
  transformerVariantGroup,
  presetUno,
} from "unocss";

export default defineConfig({
  theme: {
    fontFamily: {
      inter: "Inter",
    },
    colors: {
      text: "var(--color-text)",
      background: "var(--color-background)",
      primary: "var(--color-primary)",
      secondary: "var(--color-secondary)",
      accent: "var(--color-secondary)",
      success: "var(--color-success)",
      warning: "var(--color-warning)",
      danger: "var(--color-danger)",
    },
  },
  presets: [presetUno(), presetTypography()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
