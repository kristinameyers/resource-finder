const path = require('path');
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
    transformer,
  } = await getDefaultConfig();

  return {
    projectRoot: path.resolve(__dirname),
    watchFolders: [
      path.resolve(__dirname, '../../packages'),
      path.resolve(__dirname, '../../node_modules'),
    ],
    resolver: {
      assetExts,
      sourceExts,
      // Redirect @sb211/* paths:
      extraNodeModules: new Proxy(
        {},
        {
          get: (_, name) =>
            path.resolve(__dirname, `../../packages/${name.replace(
              /^@sb211\//,
              ''
            )}/src`),
        }
      ),
    },
  };
})();
