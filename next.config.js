/* eslint-env node */
module.exports = {
  trailingSlash: true,
  assetPrefix: process.env.NEXT_PUBLIC_MODE === "integrate" ? "/server-ui" : "",
};
