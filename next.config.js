/* eslint-env node */
module.exports = {
  trailingSlash: true,
  reactStrictMode: true,
  assetPrefix: process.env.NEXT_PUBLIC_MODE === "integrate" ? "/server-ui" : "",
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.ftl/,
      // When Next.js migrates to Webpack 5, use this and uninstall raw-loader:
      // type: "asset/source",
      use: ["raw-loader"],
    });

    return config;
  },
};
