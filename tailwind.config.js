/* eslint-env node */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./src/**/*.html",
    "./src/**/*.md",
    "./src/**/*.mdx",
    "./src/**/*.jsx",
    "./src/**/*.js",
    "./src/**/*.tsx",
    "./src/**/*.ts",
  ],
  theme: {
    extend: {},
    colors: colors,
  },
  variants: {
    extend: {
      opacity: [
        "responsive",
        "group-hover",
        "focus-within",
        "hover",
        "focus",
        "motion-safe",
      ],
      animation: ["motion-safe"],
      borderWidth: ["hover"],
      borderStyle: ["hover", "focus"],
      borderRadius: ["hover"],
      translate: ["direction"],
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("tailwindcss-dir")(),
  ],
};
