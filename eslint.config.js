import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  // Global ignore
  globalIgnores(["projects/**/*"]),

  // TypeScript files
  {
    files: ["**/*.ts"],
    extends: compat.extends(
      "plugin:@angular-eslint/recommended",
      "plugin:@angular-eslint/template/process-inline-templates",
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "google"
    ),
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        project: ["tsconfig.json"],
        createDefaultProgram: true,
      },
    },
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        { prefix: "app", style: "kebab-case", type: "element" }
      ],
      "@angular-eslint/directive-selector": [
        "error",
        { prefix: "app", style: "camelCase", type: "attribute" }
      ],
      "@angular-eslint/no-empty-lifecycle-method": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@angular-eslint/prefer-inject": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "max-len": "off",
      "require-jsdoc": "off",
      "valid-jsdoc": "off",
      "no-unused-vars": "off",
      "new-cap": "off",
      "object-curly-spacing": ["error", "always"],
      "quotes": ["error", "single", { allowTemplateLiterals: true, avoidEscape: true }],
      "spaced-comment": ["error", "always", {
        line: { markers: ["/"], exceptions: ["-", "+"] },
        block: { markers: ["!"], exceptions: ["*"], balanced: true },
      }],
      "indent": "off",
      "@/indent": [
        "error", 2, {
          CallExpression: { arguments: 1 },
          MemberExpression: "off",
          ObjectExpression: 1,
          ArrayExpression: 1,
          SwitchCase: 1,
          FunctionDeclaration: { body: 1, parameters: 1 },
          FunctionExpression: { body: 1, parameters: 1 },
          ignoredNodes: [
            "ConditionalExpression",
            "FunctionExpression > .params[decorators.length > 0]",
            "FunctionExpression > .params > :matches(Decorator, :not(:first-child))",
            "ClassBody.body > PropertyDefinition[decorators.length > 0] > .key"
          ]
        }
      ]
    }
  },

  // Special TS overrides
  {
    files: [
      "**/*.spec.ts",
      "src/app/core/store/**/*.service.ts",
      "src/app/core/firebase/*.service.ts",
      "src/app/core/analytics/time-analytics.service.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
]);