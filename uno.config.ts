import {
  defineConfig,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  theme: {
    colors: {

    },
  },
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
