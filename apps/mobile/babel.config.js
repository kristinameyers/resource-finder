module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./src'],
        alias: {
          '@': './src',
          '@/components': './src/components',
          '@/screens': './src/screens',
          '@/contexts': './src/contexts',
          '@/hooks': './src/hooks',
          '@/lib': './src/lib',
          '@/utils': './src/utils',
          '@/assets': './assets'
        }
      }],
      'react-native-worklets/plugin'
    ]
  };
};
