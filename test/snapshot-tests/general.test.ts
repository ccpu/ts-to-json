import { assertSchema } from "./assertSchema";

describe("createSchema", () => {
    it("with-promise-type", assertSchema("with-promise-type", { type: "MyObject" }));
    it("with-promise-type", assertSchema("string-literals-for-index signature", { type: "MyObject" }));
    it("generic-type-name", assertSchema("generic-type-name", { type: "MyObject" }));
    it("any-unknown", assertSchema("any-unknown", { type: "MyObject", allowArbitraryDataTypes: true }));
    it("typeof-keyof", assertSchema("typeof-keyof", { expose: "export" }));
    it("function-with-tag", assertSchema("function-with-tag", { jsDoc: "extended" }));
    it(
        "sort",
        assertSchema("sort", {
            sortProps: true,
            skipParseFiles: ["@types/react/index.d.ts", "lib.dom.d.ts"],
            skipParseTypes: ["Placement", "Instance"],
            expose: "none",
        })
    );
    it("react-class", assertSchema("react-class", { expose: "all", handleUnknownTypes: true }));
    it(
        "ignoreMultipleDefinitions",
        assertSchema("ignoreMultipleDefinitions", { type: "Props", ignoreMultipleDefinitions: true })
    );
    it(
        "function-prop-type",
        assertSchema("function-prop-type", { handleUnknownTypes: true, allowArbitraryDataTypes: true })
    );
    it("function-prop-type2", assertSchema("function-prop-type-2"));
    it("function-prop-type-alias", assertSchema("function-prop-type-alias"));
    it("module-function-declare", assertSchema("module-function-declare"));
    it("typescript-html-element-type", assertSchema("typescript-html-element-type"));
    it("extends-from-packages", assertSchema("extends-from-packages", { type: "MyProps", handleUnknownTypes: true }));
    it("circular-ref-union", assertSchema("circular-ref-union", { type: "MyType", expose: "all" }));
    it(
        "handle-unknown-type-in-npm-package",
        assertSchema("handle-unknown-type-in-npm-package", {
            type: "MyType",
            allowArbitraryDataTypes: true,
            handleUnknownTypes: true,
        })
    );
    it("skipFiles option", assertSchema("skipFiles", { type: "MyType", skipParseFiles: ["external-props.ts"] }));
    it("skipTypes option", assertSchema("skipTypes", { type: "MyType", skipParseTypes: ["ExternalProps"] }));
    it("skip-function-types", assertSchema("skip-function-types", { type: "MyObject", skipParseTypes: ["function"] }));
    it(
        "should parse type even if type is in skipParseFiles list",
        assertSchema("skipFiles-with-forceToParseTypes", {
            type: "MyType",
            skipParseFiles: ["external-props.ts"],
            forceToParseTypes: ["ExternalProps"],
        })
    );
    it(
        "should parse type even if type is in skipTypes list",
        assertSchema("skipTypes-with-forceToParseTypes", {
            type: "MyType",
            skipParseTypes: ["ExternalProps"],
            forceToParseTypes: ["ExternalProps"],
        })
    );
    it(
        "should not parse node when shouldParseNode return false",
        assertSchema("shouldParseNode-option", {
            expose: "none",
            type: "MyType",
            shouldParseNode: (node) => {
                const file = node.getSourceFile().fileName;
                if (file.endsWith("external-props.ts")) {
                    return false;
                }
                return true;
            },
        })
    );
    it(
        "should parse node even if shouldParseNode return false",
        assertSchema("shouldParseNode-option-force", {
            type: "MyType",
            forceToParseTypes: ["ExternalProps"],
            expose: "none",
            shouldParseNode: (node) => {
                const file = node.getSourceFile().fileName;
                if (file.endsWith("external-props.ts")) {
                    return false;
                }
                return true;
            },
        })
    );
    it(
        "with-promise-type",
        assertSchema("suppress-invalid-index-error", { type: "MyObject", invalidIndexHandlingMode: "suppress" })
    );

    it("should throw error with invalid index", () => {
        expect(assertSchema("suppress-invalid-index-error", { type: "MyObject" })).toThrow();

        expect(
            assertSchema("suppress-invalid-index-error", { type: "MyObject", invalidIndexHandlingMode: "throw" })
        ).toThrow();
    });
});
