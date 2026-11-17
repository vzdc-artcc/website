import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
    ...nextVitals,
    // .claude/ holds the issue worktrees, each a full checkout with its own
    // .next/ output; linting from the primary checkout would otherwise walk them.
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".claude/**"]),
]);
