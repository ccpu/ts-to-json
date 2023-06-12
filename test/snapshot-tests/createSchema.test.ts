import { resolve } from "path";
import { assertSchema, basePath } from "./assertSchema";
import { getRelativeDirectories } from "../unit/get-directories";

describe("createSchema", () => {
    const dirs = getRelativeDirectories(resolve(`${basePath}/limit-options`));

    dirs.forEach((dir) => {
        it(
            "excludeRootProps" + dir,
            assertSchema("limit-options/" + dir, {
                type: "MyObject",
                handleUnknownTypes: true,
                excludeRootProps: ["c", "a.b.c", "with-dash", "a.b.d.e", "x.d.e.f", "x.y", "a.b.x.c"],
                expose: "none",
                schemaExtension: "excludeRootProps",
            })
        );
    });

    dirs.forEach((dir) => {
        it(
            "includeProps" + dir,
            assertSchema("limit-options/" + dir, {
                type: "MyObject",
                handleUnknownTypes: true,
                includeProps: ["a.b", "c", "with-dash", "x"],
                expose: "none",
                schemaExtension: "includeProps",
            })
        );
    });

    dirs.forEach((dir) => {
        it(
            "maxDepth-1" + dir,
            assertSchema("limit-options/" + dir, {
                type: "MyObject",
                handleUnknownTypes: true,
                maxDepth: 1,
                expose: "none",
                schemaExtension: "maxDepth-1",
            })
        );
    });

    dirs.forEach((dir) => {
        it(
            "includeProps-maxDepth" + dir,
            assertSchema("limit-options/" + dir, {
                type: "MyObject",
                handleUnknownTypes: true,
                maxDepth: 2,
                expose: "none",
                schemaExtension: "includeProps-maxDepth",
                includeProps: ["a"],
            })
        );
    });

    dirs.forEach((dir) => {
        it(
            "excludeRootProps-maxDepth" + dir,
            assertSchema("limit-options/" + dir, {
                type: "MyObject",
                handleUnknownTypes: true,
                maxDepth: 1,
                expose: "none",
                schemaExtension: "excludeRootProps-maxDepth",
                excludeRootProps: ["c", "b"],
            })
        );
    });

    dirs.forEach((dir) => {
        it(
            "excludeProps" + dir,
            assertSchema("limit-options/" + dir, {
                type: "MyObject",
                handleUnknownTypes: true,
                expose: "none",
                schemaExtension: "excludeProps",
                excludeProps: ["a", "b"],
            })
        );
    });

    const limitOptionsFunctionsDirs = getRelativeDirectories(resolve(`${basePath}/limit-options-functions`));

    limitOptionsFunctionsDirs.forEach((dir) => {
        it(
            "limit-options-functions/" + dir,
            assertSchema("limit-options-functions/" + dir, {
                type: "MyObject",
                schemaExtension: "funcParamMaxDepth-1",
                handleUnknownTypes: true,
                expose: "none",
                funcParamMaxDepth: 1,
            })
        );
    });

    limitOptionsFunctionsDirs.forEach((dir) => {
        it(
            "limit-options-functions/" + dir,
            assertSchema("limit-options-functions/" + dir, {
                type: "MyObject",
                schemaExtension: "funcParamMaxDepth-2",
                handleUnknownTypes: true,
                expose: "none",
                funcParamMaxDepth: 2,
            })
        );
    });

    limitOptionsFunctionsDirs.forEach((dir) => {
        it(
            "limit-options-functions/" + dir,
            assertSchema("limit-options-functions/" + dir, {
                type: "MyObject",
                schemaExtension: "includeProps-a",
                handleUnknownTypes: true,
                expose: "none",
                includeProps: ["a"],
            })
        );
    });
});
