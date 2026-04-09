import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/", "dist/", ".git/", ".env*"]
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly"
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      "indent": ["error", 4],
      "linebreak-style": "off",
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-console": "off",
      "no-case-declarations": "warn",
      "preserve-caught-error": "off"
    }
  }
];
