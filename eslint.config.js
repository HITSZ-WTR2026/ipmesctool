import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReactHooks from "eslint-plugin-react-hooks";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  { ignores: [".react-router/*", "app/components/ui"] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  // https://stackoverflow.com/questions/72780296/warning-react-version-not-specified-in-eslint-plugin-react-settings-while-run
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      // ✅ 强制遵守 Hook 规则
      "react-hooks/rules-of-hooks": "error",
      // ✅ 检查依赖数组是否正确
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      // React 17 + 无需改规则
      "react/react-in-jsx-scope": "off",
    },
  },
  eslintConfigPrettier,
];
