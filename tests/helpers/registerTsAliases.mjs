import { registerHooks } from "node:module";

// Match the app's @/ alias when Node runs the TypeScript modules directly.
registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier.startsWith("@/")) {
            return nextResolve(new URL(`../../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
        }
        return nextResolve(specifier, context);
    },
});
