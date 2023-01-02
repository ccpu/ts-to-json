import ts from "typescript";

export interface Config {
    path?: string;
    type?: string;
    minify?: boolean;
    schemaId?: string;
    tsconfig?: string;
    expose?: "all" | "none" | "export";
    topRef?: boolean;
    jsDoc?: "none" | "extended" | "basic";
    sortProps?: boolean;
    strictTuples?: boolean;
    skipTypeCheck?: boolean;
    encodeRefs?: boolean;
    extraTags?: string[];
    additionalProperties?: boolean;

    /**
     *   Node that enabling this option can have side effects!
     *   If two file using same interface/type name and linking them together, the following error will be thrown:
     *   'Type "Props" has multiple definitions.'
     *   It is good practice to not have same name for the type in the working file,
     *   so changing the type name will solve the problem.
     *   however if you like to suppress the error you can use this options.
     */
    ignoreMultipleDefinitions?: boolean;

    /**
     *   If returns false the node type name will be used instead of parsing node and its children.
     *   e.g. HTMLElement will stay HTMLElement
     *   This option has priority over other limit options.
     */
    shouldParseNode?: (node: ts.Node) => boolean;

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

    /**
        If set to true types like any,unknown,HTMLElement ... will be set
    */
    allowArbitraryDataTypes?: boolean;
}

export const DEFAULT_CONFIG: Config = {
    expose: "export",
    topRef: true,
    jsDoc: "extended",
    sortProps: true,
    strictTuples: false,
    skipTypeCheck: false,
    encodeRefs: true,
    minify: false,
    extraTags: [],
    showUnknownTypeInfo: true,
    additionalProperties: false,
};
