const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config'); // Use this if Expo, else metro-config

const packagesPath = path.resolve(__dirname, '../../packages');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  const { resolver: { sourceExts, assetExts } } = defaultConfig;

  return {
    ...defaultConfig,
    watchFolders: [
      packagesPath,
      path.resolve(__dirname, '../../node_modules'),
    ],
    resolver: {
      ...defaultConfig.resolver,
      assetExts,
      sourceExts,
      extraNodeModules: new Proxy(
        {},
        {
          get: (target, name) => {
            // Redirect @sb211/* packages, else fallback to regular node_modules
            if (name.startsWith('@sb211/')) {
              const pkg = name.replace('@sb211/', '');
              return path.join(packagesPath, pkg, 'src');
            }
            return path.join(__dirname, 'node_modules', name);
          },
        }
      ),
    },
  };
})();
