/* eslint-env node */
module.exports = {
  trailingSlash: true,
  reactStrictMode: true,
  assetPrefix: process.env.NEXT_PUBLIC_MODE === "integrate" ? "/server-ui" : "",
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.ftl/,
      type: "asset/source",
    });

    return config;
  },
};
