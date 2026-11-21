module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!(" +
      "(jest-)?react-native" +
      "|@react-native(-community)?" +
      "|expo(nent)?" +
      "|@expo(nent)?/.*" +
      "|@expo-google-fonts/.*" +
      "|@unimodules/.*" +
      "|unimodules" +
      "|react-native-svg" +
      "|react-native-reanimated" +
      "|react-native-gesture-handler" +
      "|react-native-keyboard-controller" +
      "|react-native-mmkv" +
      "|@csark0812/zustand-expo-devtools" +
      "|zustand" +
      "))",
  ],
  collectCoverageFrom: [
    "src/domain/**/*.{ts,tsx}",
    "src/data/repositories/**/*.{ts,tsx}",
    "src/data/simulated/**/*.{ts,tsx}",
    "src/data/socket/**/*.{ts,tsx}",
    "src/data/mappers/**/*.{ts,tsx}",
    "src/data/cache/**/*.{ts,tsx}",
    "src/infrastructure/**/*.{ts,tsx}",
    "src/presentation/hooks/**/*.{ts,tsx}",
    "src/presentation/theme/**/*.{ts,tsx}",
    "src/presentation/stores/**/*.{ts,tsx}",
    "src/presentation/features/chat/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/index.ts",
    "!**/node_modules/**",
    "!**/__tests__/**",
    "!**/*.test.{ts,tsx}",
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 50,
      statements: 50,
    },
    "src/domain/": {
      branches: 60,
      functions: 60,
      lines: 65,
      statements: 65,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts", "@testing-library/react-native/matchers"],
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}", "**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    "^@mocks/(.*)$": "<rootDir>/src/__mocks__/$1",
    "^@/(.*)$": "<rootDir>/$1",
    "^@data/(.*)$": "<rootDir>/src/data/$1",
    "^@stores/(.*)$": "<rootDir>/src/presentation/stores/$1",
    "^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@di/(.*)$": "<rootDir>/src/di/$1",
    "^@theme$": "<rootDir>/src/presentation/theme",
    "^@theme/(.*)$": "<rootDir>/src/presentation/theme/$1",
    "^@domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@presentation/(.*)$": "<rootDir>/src/presentation/$1",
    "^@assets/(.*)$": "<rootDir>/src/assets/$1",
    "react-native-keyboard-controller":
      "<rootDir>/src/__mocks__/react-native-keyboard-controller.ts",
    "\\.svg$": "<rootDir>/src/__mocks__/svgMock.js",
  },
};
