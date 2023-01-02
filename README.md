# ts-to-json

Extended version of [https://github.com/xiag-ag/typescript-to-json-schema](https://github.com/xiag-ag/typescript-to-json-schema).

Inspired by [`YousefED/typescript-json-schema`](https://github.com/YousefED/typescript-json-schema). Here's the differences list:

-   this implementation avoids the use of `typeChecker.getTypeAtLocation()` (so probably it keeps correct type aliases)
-   processing AST and formatting JSON schema have been split into two independent steps
-   not exported types, interfaces, enums are not exposed in the `definitions` section in the JSON schema

## Contributors

This project is made possible by a [community of contributors](https://github.com/vega/ts-json-schema-generator/graphs/contributors). We welcome contributions of any kind (issues, code, documentation, examples, tests,...). Please read our [code of conduct](https://github.com/vega/vega/blob/master/CODE_OF_CONDUCT.md).

## CLI Usage

```bash
npm install --save ts-to-json
./node_modules/.bin/ts-to-json --path 'my/project/**.*.ts' --type 'My.Type.Full.Name'
```

## Programmatic Usage

```js
// main.js

const tsj = require("ts-to-json");
const fs = require("fs");

const config = {
    path: "path/to/source/file",
    tsconfig: "path/to/tsconfig.json",
    type: "*", // Or <type-name> if you want to generate schema for that one type only
    expose: "export",
    jsDoc: "extended",
    topRef: true,
};

const output_path = "path/to/output/file";

const schema = tsj.createGenerator(config).createSchema(config.type);
const schemaString = JSON.stringify(schema, null, 2);
fs.writeFile(output_path, schemaString, (err) => {
    if (err) throw err;
});
```

Run the schema generator via `node main.js`.

## Options

```
-p, --path 'index.ts'
    The path to the TypeScript source file. If this is not provided, the type will be searched in the project specified in the `.tsconfig`.

-t, --type 'My.Type.Full.Name'
    The type the generated schema will represent. If omitted, the generated schema will contain all
    types found in the files matching path. The same is true if '*' is specified.

-e, --expose <all|none|export>
    all: Create shared $ref definitions for all types.
    none: Do not create shared $ref definitions.
    export (default): Create shared $ref definitions only for exported types.

-f, --tsconfig 'my/project/tsconfig.json'
    Use a custom tsconfig file for processing typescript (see https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) instead of the default:
    {
        "compilerOptions": {
            "noEmit": true,
            "emitDecoratorMetadata": true,
            "experimentalDecorators": true,
            "target": "ES5",
            "module": "CommonJS",
            "strictNullChecks": false,
        }
    }

-j, --jsDoc <extended|none|basic>
    none: Do not use JsDoc annotations.
    basic: Read JsDoc annotations to provide schema properties.
    extended (default): Also read @nullable, and @asType annotations.

--unstable
    Do not sort properties.

--strict-tuples
    Do not allow additional items on tuples.

--no-top-ref
    Do not create a top-level $ref definition.

--no-type-check
    Skip type checks for better performance.

--no-ref-encode
    Do not encode references. According to the standard, references must be valid URIs but some tools do not support encoded references.

--validationKeywords
    Provide additional validation keywords to include.

-o, --out
    Specify the output file path. Without this option, the generator logs the response in the console.
```

## Current state

-   `interface` types
-   `enum` types
-   `union`, `tuple`, `type[]` types
-   `string`, `boolean`, `number` types
-   `"value"`, `123`, `true`, `false`, `null`, `undefined` literals
-   type aliases
-   generics
-   `typeof`
-   `keyof`
-   conditional types

## Run locally

`yarn --silent run run --path 'test/valid-data/type-mapped-array/*.ts' --type 'MyObject'`

## Debug

`yarn --silent run debug --path 'test/valid-data/type-mapped-array/*.ts' --type 'MyObject'`

And connect via the debugger protocol.

[AST Explorer](https://astexplorer.net/) is amazing for developers of this tool!

## Other options

> Currently this options are only available when using this package programmatically.

```
     /**
     *   Node that enabling this option can have side effects!
     *   If two file using same interface/type name and linking them together, the following error will be thrown:
     *   'Type "Props" has multiple definitions.'
     *   It is good practice to not have same name for the type in the working file, so changing the type name will solve the problem.
     *   however if you like to suppress the error you can use this options.
     */
    ignoreMultipleDefinitions?: boolean;

    /**
     *   If returns false the node type name will be used instead of parsing node and its children.
     *   e.g. HTMLElement will stay HTMLElement
     *   This option has priority over other limit options.
     */
    shouldParseNode?: (node: Node) => boolean;

    /**
     *  Use this option when parser unable to parse specific type and throws error.
     *  This option force the parser identified type as unknown type.
     */
    handleUnknownTypes?: boolean;

    /**
     *   When unknown type detected, the node info will be displayed.
     */
    showUnknownTypeInfo?: boolean;

    /**
     *   Types located in the file wont be processed, instead name of type will be returned.
     *   e.g. HTMLElement is located in lib.dom.d.ts file, hence the HTMLElement will be the type
     */
    skipParseFiles?: string[];

    /**
     *   Type names within the list wont be proceeded instead the name of the type will be returned.
     *   e.g. HTMLElement will stay HTMLElement
     */
    skipParseTypes?: string[];

    /**
     *   Names within the list must be processed even if its in skipParseFiles or skipParseTypes list
     */
    forceToParseTypes?: string[];

    /*
        If set to true types like any, unknown will be set
    */
    allowArbitraryDataTypes?: boolean;

```

> The following option can only be used when `expose` set to `none` and `type` option provided.

```

    /**
     *   Will exclude props names specified in the list from root. accepts path eg. a.b
     */
    excludeRootProps?: string[];

    /**
     *   Will exclude prop names specified in the list regardless of root and childrens.
     */
    excludeProps?: string[];

    /**
     *  Will only generate schema for the property names included in the list.
     *  excludeRootProps option has no effect when using this option.
     */
    includeProps?: string[];

    /**
     *  This option has priority over includeProps and excludeRootProps options.
     */
    maxDepth?: number;

    /**
    *  Limits the maximum depth of function parameters
    */
    funcParamMaxDepth?: number;

```
