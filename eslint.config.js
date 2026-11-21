const expoConfig = require("eslint-config-expo/flat");
const eslintConfigPrettier = require("eslint-config-prettier");
const tseslint = require("typescript-eslint");

const expoImportPlugin = expoConfig.find((config) => config.plugins?.import)?.plugins.import;
const importPlugin = expoImportPlugin || require("eslint-plugin-import");

module.exports = [
  ...expoConfig,
  {
    name: "chat-roulette/ignores",
    ignores: [
      "dist/*",
      ".expo/*",
      ".expo/cache/*",
      ".expo/dev/*",
      ".expo/web/*",
      "node_modules/*",
      "coverage/*",
    ],
  },
  {
    name: "chat-roulette/custom-rules",
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/no-duplicates": "error",
      "import/no-cycle": "error",
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./src/domain",
              from: ["./src/data", "./src/presentation", "./src/infrastructure"],
              message:
                "Domain layer must not depend on outer layers (Data, Presentation, or Infrastructure).",
            },
            {
              target: "./src/domain",
              from: "./src/di",
              message: "Domain layer must not depend on DI container.",
            },
            {
              target: "./src/presentation",
              from: "./src/data",
              message:
                "Presentation must not import from Data layer directly. Use Domain layer interfaces through DI.",
            },
            {
              target: "./src/domain/usecases/**/*UseCase.ts",
              from: "./src/domain/usecases/**/*UseCase.ts",
              message: "Use cases should not depend on other use cases.",
            },
          ],
        },
      ],
      "@typescript-eslint/no-deprecated": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-console": ["error", { allow: ["error", "warn"] }],
      "no-inline-comments": [
        "error",
        {
          ignorePattern:
            "^\\s*(@ts-|eslint|prettier|istanbul|coverage|jest-environment|sourceMapping)",
        },
      ],
    },
  },
  {
    name: "chat-roulette/test-overrides",
    files: ["**/__tests__/**/*.ts", "**/__tests__/**/*.tsx", "**/*.test.ts", "**/*.test.tsx"],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
    rules: {
      "import/no-restricted-paths": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-deprecated": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/switch-exhaustiveness-check": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/consistent-type-exports": "off",
    },
  },
  {
    name: "chat-roulette/js-overrides",
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      parser: require("espree"),
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/no-deprecated": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/switch-exhaustiveness-check": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/consistent-type-exports": "off",
    },
  },
  {
    name: "chat-roulette/scripts-overrides",
    files: ["scripts/**/*.js", "scripts/**/*.mjs", "*.config.js"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        console: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  eslintConfigPrettier,
];
