import pluginJs from "@eslint/js";
import pluginImport from "eslint-plugin-import";
import pluginReact from "eslint-plugin-react";
import next from "@next/eslint-plugin-next";
import globals from "globals";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // --------------------------------------------------
  // Files / ignores
  // --------------------------------------------------
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    ignores: [
      ".github/",
      ".husky/",
      "node_modules/",
      ".next/",
      "src/components/ui",
      "*.config.ts",
      "*.mjs",
    ],
  },

  // --------------------------------------------------
  // Language / parser / settings
  // --------------------------------------------------
  {
    languageOptions: {
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },

    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },

    plugins: {
      import: pluginImport,
      prettier,
    },
  },

  // --------------------------------------------------
  // Recommended (flat-safe)
  // --------------------------------------------------
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  next.configs["core-web-vitals"],
  ...tseslint.configs.recommended,

  // --------------------------------------------------
  // Rules
  // --------------------------------------------------
  {
    rules: {
      // --- Prettier ---
      "prettier/prettier": [
        "warn",
        {
          endOfLine: "auto",
        },
      ],

      // --- React / Next ---
      "react/react-in-jsx-scope": "off", // React 17+
      "react/prop-types": "off",
      "react/jsx-no-useless-fragment": "warn",
      "react/no-array-index-key": "warn",

      // --- TypeScript ---
      "@typescript-eslint/no-unused-vars": ["warn"],
      "@typescript-eslint/no-explicit-any": "warn",

      // --- Imports ---
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/newline-after-import": "error",
      "import/no-unresolved": "error",

      // --- General ---
      "no-trailing-spaces": "error",
      "no-duplicate-imports": "error",
    },
  },
];
