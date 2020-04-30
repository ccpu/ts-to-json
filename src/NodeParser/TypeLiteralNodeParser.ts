import * as ts from "typescript";
import { Context, NodeParser } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { BaseType } from "../Type/BaseType";
import { ObjectProperty, ObjectType } from "../Type/ObjectType";
import { ReferenceType } from "../Type/ReferenceType";
import { isNodeHidden } from "../Utils/isHidden";
import { isExcludedProp } from "../Utils";
import { getKey } from "../Utils/nodeKey";
import { Config } from "../Config";

export class TypeLiteralNodeParser implements SubNodeParser {
    public constructor(private childNodeParser: NodeParser, private config: Config) {}

    public supportsNode(node: ts.TypeLiteralNode): boolean {
        return node.kind === ts.SyntaxKind.TypeLiteral;
    }
    public createType(node: ts.TypeLiteralNode, context: Context, reference?: ReferenceType): BaseType | undefined {
        const id = this.getTypeId(node, context);
        if (reference) {
            reference.setId(id);
            reference.setName(id);
        }

        const properties = this.getProperties(node, context);

        if (properties === undefined) {
            return undefined;
        }

        return new ObjectType(id, [], properties, this.getAdditionalProperties(node, context));
    }

    private getProperties(node: ts.TypeLiteralNode, context: Context): ObjectProperty[] | undefined {
        let hasRequiredNever = false;

        const properties = node.members
            .filter((x) => ts.isPropertySignature(x) || ts.isMethodSignature(x))
            .filter((propertyNode) => !isNodeHidden(propertyNode))
            .filter((propertyNode) => !isExcludedProp(propertyNode, context, this.config))
            .map((propertyNode: any) => {
                const propertySymbol: ts.Symbol = (propertyNode as any).symbol;
                const type = this.childNodeParser.createType(
                    ts.isMethodSignature(propertyNode) ? propertyNode : propertyNode.type!,
                    context
                );
                const objectProperty = new ObjectProperty(propertySymbol.getName(), type, !propertyNode.questionToken);

                return objectProperty;
            })
            .filter((prop) => {
                if (prop.isRequired() && prop.getType() === undefined) {
                    hasRequiredNever = true;
                }
                return prop.getType() !== undefined;
            });

        if (hasRequiredNever) {
            return undefined;
        }

        return properties;
    }

    private getAdditionalProperties(node: ts.TypeLiteralNode, context: Context): BaseType | false {
        const indexSignature = node.members.find(ts.isIndexSignatureDeclaration);
        if (!indexSignature) {
            return false;
        }

        return this.childNodeParser.createType(indexSignature.type!, context) ?? false;
    }

    private getTypeId(node: ts.Node, context: Context): string {
        return `structure-${getKey(node, context)}`;
    }
}
