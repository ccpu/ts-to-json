import { program } from "commander";
import { writeFile } from "fs";
// import * as stringify from "json-stable-stringify";
import { createGenerator } from "./factory/generator";
import { Config, DEFAULT_CONFIG } from "./src/Config";
import { BaseError } from "./src/Error/BaseError";
import { formatError } from "./src/Utils/formatError";

program
    .option("-p, --path <path>", "Source file path")
    .option("-t, --type <name>", "Type name")
    .option("-f, --tsconfig <path>", "Custom tsconfig.json path")
    .option("-e, --expose <expose>", "Type exposing", /^(all|none|export)$/, "export")
    .option("-j, --jsDoc <extended>", "Read JsDoc annotations", /^(none|basic|extended)$/, "extended")
    .option("--unstable", "Do not sort properties")
    .option("--strict-tuples", "Do not allow additional items on tuples")
    .option("--no-top-ref", "Do not create a top-level $ref definition")
    .option("--no-type-check", "Skip type checks to improve performance")
    .option("--no-ref-encode", "Do not encode references")
    .option("-o, --out <file>", "Set the output file (default: stdout)")
    .option(
        "--validationKeywords [value]",
        "Provide additional validation keywords to include",
        (value: string, list: string[]) => list.concat(value),
        []
    )

    .parse(process.argv);

const options = program.opts();

const config: Config = {
    ...DEFAULT_CONFIG,
    path: options.path,
    tsconfig: options.tsconfig,
    type: options.type,
    expose: options.expose,
    topRef: options.topRef,
    jsDoc: options.jsDoc,
    sortProps: !options.unstable,
    strictTuples: options.strictTuples,
    skipTypeCheck: !options.typeCheck,
    encodeRefs: options.refEncode,
    extraTags: options.validationKeywords,
};

try {
    const schema = createGenerator(config).createSchema(options.type);
    const schemaString = JSON.stringify(schema, null, 2);

    if (options.out) {
        // write to file
        writeFile(options.out, schemaString, (err) => {
            if (err) throw err;
        });
    } else {
        // write to stdout
        process.stdout.write(schemaString);
    }
} catch (error) {
    if (error instanceof BaseError) {
        process.stderr.write(formatError(error));
        process.exit(1);
    } else {
        throw error;
    }
}
