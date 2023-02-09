module.exports = {
  extends: ["next/core-web-vitals", "prettier"],
  rules: {
    // We export to static HTML, which precludes the use of <Image>
    "@next/next/no-img-element": "off",
  },
};
