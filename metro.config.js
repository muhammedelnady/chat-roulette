const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = (() => {
  const defaultConfig = getDefaultConfig(__dirname);
  const { resolver } = defaultConfig;

  defaultConfig.resolver = {
    ...resolver,
    blockList: [/.*\.(test|spec)\.(js|jsx|ts|tsx)$/, /.*\/__tests__\/.*/, /.*\/__mocks__\/.*/],
  };

  return defaultConfig;
})();

module.exports = config;
