import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// This configuration extends Next.js core web vitals,
// which relies on @typescript-eslint/parser.
// Ensure 'typescript' is installed as a dev dependency.
const eslintConfig = [...compat.extends("next/core-web-vitals"),
  {
  rules:{
  "@next/next/no-img-element":"off"
}
}
];

export default eslintConfig;
