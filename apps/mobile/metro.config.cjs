const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');
const appSrcPath = path.resolve(__dirname, 'src');
const packagesPath = path.resolve(__dirname, '../../packages');
const sharedSchemaPath = path.resolve(__dirname, '../../packages/shared-schema/src');

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
      unstable_enableSymlinks: true,
      unstable_enablePackageExports: true,
      extraNodeModules: new Proxy(
        {},
        {
          get: (target, name) => {
            // Support @/ for root app src
            if (name === '@') {
              return appSrcPath;
            }
            // Support @sb211/shared-schema
            if (name === '@sb211/shared-schema') {
              return sharedSchemaPath;
            }
            // Support @sb211/* package imports
            if (name.startsWith('@sb211/')) {
              const pkg = name.replace('@sb211/', '');
              return path.join(packagesPath, pkg, 'src');
            }
            // Fallback: node_modules
            return path.join(__dirname, 'node_modules', name);
          },
        }
      ),
    },
  };
})();
