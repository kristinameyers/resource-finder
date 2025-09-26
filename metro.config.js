// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

// Ensure `json` is listed among source extensions.
// (If you already have a custom `resolver` object, just add the line.)
defaultConfig.resolver.sourceExts.push("json");

module.exports = defaultConfig;