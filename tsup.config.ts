import { defineConfig } from "tsup";

export default defineConfig([
    {
        clean: true,
        entry: ["./index.ts", "./ts-to-json.ts"],
        format: ["cjs", "esm"],
        dts: true,
        minify: true,
        esbuildOptions(options, context) {
            options.platform = "node";
        },
    },
]);
