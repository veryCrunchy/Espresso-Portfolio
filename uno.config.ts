import {
  defineConfig,
  presetTypography,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

// Tailwind's type scale, multiplied by --text-scale (set per site/page from the CMS).
const TEXT_SIZES: Record<string, [size: number, lineHeight: number | string]> = {
  xs: [0.75, 1],
  sm: [0.875, 1.25],
  base: [1, 1.5],
  lg: [1.125, 1.75],
  xl: [1.25, 1.75],
  "2xl": [1.5, 2],
  "3xl": [1.875, 2.25],
  "4xl": [2.25, 2.5],
  "5xl": [3, "1"],
  "6xl": [3.75, "1"],
  "7xl": [4.5, "1"],
  "8xl": [6, "1"],
  "9xl": [8, "1"],
};

const RADII: Record<string, number> = { xs: 0.125, sm: 0.25, md: 0.375, lg: 0.5, xl: 0.75, "2xl": 1, "3xl": 1.5, "4xl": 2 };

const scaled = (rem: number, variable: string) => `calc(${rem}rem * var(${variable}, 1))`;

// Headlines get their own multiplier (--heading-scale) on top of the text scale, so
// big titles can be toned down without shrinking body copy.
const headlineCss = `.headline {
  font-family: var(--font-heading);
${Object.entries(TEXT_SIZES)
  .map(([key, [size, lineHeight]]) => {
    const factor = "var(--text-scale, 1) * var(--heading-scale, 1)";
    const lh = typeof lineHeight === "number" ? `calc(${lineHeight}rem * ${factor})` : lineHeight;
    return `  --text-${key}-fontSize: calc(${size}rem * ${factor});\n  --text-${key}-lineHeight: ${lh};`;
  })
  .join("\n")}
}`;

export default defineConfig({
  theme: {
    font: {
      sans: "var(--font-body)",
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
    text: Object.fromEntries(
      Object.entries(TEXT_SIZES).map(([key, [size, lineHeight]]) => [
        key,
        { fontSize: scaled(size, "--text-scale"), lineHeight: typeof lineHeight === "number" ? scaled(lineHeight, "--text-scale") : lineHeight },
      ]),
    ),
    // All padding/margin/gap/size utilities derive from --spacing; --space-scale makes pages denser or airier.
    spacing: {
      DEFAULT: scaled(0.25, "--space-scale"),
    },
    radius: Object.fromEntries(Object.entries(RADII).map(([key, rem]) => [key, scaled(rem, "--radius-scale")])),
    container: {
      content: "var(--content-width, 72rem)",
    },
  },
  preflights: [{ getCSS: () => headlineCss }],
  presets: [presetWind4({ preflights: { reset: true } }), presetTypography()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
