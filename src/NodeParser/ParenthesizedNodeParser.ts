import ts from "typescript";
import { Context, NodeParser } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { BaseType } from "../Type/BaseType";
import { NeverType } from "../Type/NeverType";

export class ParenthesizedNodeParser implements SubNodeParser {
    public constructor(protected childNodeParser: NodeParser) {}

    public supportsNode(node: ts.ParenthesizedTypeNode): boolean {
        return node.kind === ts.SyntaxKind.ParenthesizedType;
    }
    public createType(node: ts.ParenthesizedTypeNode, context: Context): BaseType {
        const type = this.childNodeParser.createType(node.type, context);
        if (!type) {
            return new NeverType();
        }
        return type;
    }
}
