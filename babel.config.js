/** @format */

module.exports = function (api) {
  const isTest = api.env("test");
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ...(isTest ? ["dynamic-import-node"] : []),
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
            "@domain": "./src/domain",
            "@data": "./src/data",
            "@infrastructure": "./src/infrastructure",
            "@di": "./src/di",
            "@presentation": "./src/presentation",
            "@assets": "./src/assets",
            "@stores": "./src/presentation/stores",
            "@theme": "./src/presentation/theme",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
