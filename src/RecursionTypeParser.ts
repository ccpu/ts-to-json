import * as ts from "typescript";
import { Context, NodeParser } from "./NodeParser";
import { SubNodeParser } from "./SubNodeParser";
import { BaseType } from "./Type/BaseType";
import { ReferenceType } from "./Type/ReferenceType";
import { getClosestTopLevelDeclarationName, getTypeReferenceNodeName, hasLimitOptions } from "./Utils";
import { Config } from "../src/Config";
import { TypeReferenceNodeParser } from "./NodeParser/TypeReferenceNodeParser";

export class RecursionTypeParser implements SubNodeParser {
    public constructor(
        private typeChecker: ts.TypeChecker,
        private chainNodeParser: NodeParser,
        private config: Config
    ) {}

    public supportsNode(node: ts.Node): boolean {
        if (node.kind !== ts.SyntaxKind.TypeReference || !hasLimitOptions(this.config) || !this.config.type)
            return false;
        const typeName = getTypeReferenceNodeName(node);

        const refTopLevelName = getClosestTopLevelDeclarationName(node);

        if (typeName === this.config.type && refTopLevelName === this.config.type) {
            return true;
        }

        return false;
    }

    public createType(node: ts.TypeReferenceNode, context: Context, reference?: ReferenceType): BaseType {
        const parser = new TypeReferenceNodeParser(this.typeChecker, this.chainNodeParser, this.config);
        const type = parser.createType(node, new Context(node, context));

        return type;
    }
}
