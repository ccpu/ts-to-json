import ts from "typescript";
import { Config } from "../Config";
import { UnknownTypeReference } from "../Error/UnknownTypeReference";
import { Context, NodeParser } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { AnnotatedType } from "../Type/AnnotatedType";
import { ArrayType } from "../Type/ArrayType";
import { BaseType } from "../Type/BaseType";
import { StringType } from "../Type/StringType";
import { UnknownSymbolType } from "../Type/UnknownSymbolType";
import { AnyType } from "../Type/AnyType";
import { UnknownSymbolDeclarations } from "../Error/UnknownSymbolDeclarations";

const invalidTypes: Record<number, boolean> = {
    [ts.SyntaxKind.ModuleDeclaration]: true,
    [ts.SyntaxKind.VariableDeclaration]: true,
};

export class TypeReferenceNodeParser implements SubNodeParser {
    public constructor(
        protected typeChecker: ts.TypeChecker,
        protected childNodeParser: NodeParser,
        private config: Config
    ) {}

    public supportsNode(node: ts.TypeReferenceNode): boolean {
        return node.kind === ts.SyntaxKind.TypeReference;
    }

    public createType(node: ts.TypeReferenceNode, context: Context): BaseType {
        const typeSymbol =
            this.typeChecker.getSymbolAtLocation(node.typeName) ??
            // When the node doesn't have a valid source file, its position is -1, so we can't
            // search for a symbol based on its location. In that case, the ts.factory defines a symbol
            // property on the node itself.
            (node.typeName as unknown as ts.Type).symbol;

        if (typeSymbol.name === "unknown") {
            if (this.config.handleUnknownTypes)
                return new UnknownSymbolType(node, typeSymbol, this.config.allowArbitraryDataTypes);
        }

        // Wraps promise type to avoid resolving to a empty Object type.
        if (typeSymbol.name === "Promise") {
            return this.childNodeParser.createType(node.typeArguments![0]!, this.createSubContext(node, context));
        }

        if (typeSymbol.flags & ts.SymbolFlags.Alias) {
            const aliasedSymbol = this.typeChecker.getAliasedSymbol(typeSymbol);

            if (aliasedSymbol.name === "unknown") {
                if (this.config.handleUnknownTypes)
                    return new UnknownSymbolType(node, aliasedSymbol, this.config.allowArbitraryDataTypes);
                throw new UnknownTypeReference(node);
            }

            return this.childNodeParser.createType(
                aliasedSymbol.declarations!.filter((n: ts.Declaration) => !invalidTypes[n.kind])[0],
                this.createSubContext(node, context)
            );
        }

        if (typeSymbol.flags & ts.SymbolFlags.TypeParameter) {
            return context.getArgument(typeSymbol.name);
        }

        if (typeSymbol.name === "Array" || typeSymbol.name === "ReadonlyArray") {
            const type = this.createSubContext(node, context).getArguments()[0];

            return type === undefined ? new AnyType() : new ArrayType(type);
        }

        if (typeSymbol.name === "Date") {
            return new AnnotatedType(new StringType(), { format: "date-time" }, false);
        }

        if (typeSymbol.name === "RegExp") {
            return new AnnotatedType(new StringType(), { format: "regex" }, false);
        }

        if (typeSymbol.name === "URL") {
            return new AnnotatedType(new StringType(), { format: "uri" }, false);
        }

        // My Code  ------
        if (!typeSymbol.declarations) {
            if (this.config.handleUnknownTypes)
                return new UnknownSymbolType(node, typeSymbol, this.config.allowArbitraryDataTypes);
            throw new UnknownSymbolDeclarations(node);
        }
        // ---------------

        return this.childNodeParser.createType(
            typeSymbol.declarations!.filter((n: ts.Declaration) => !invalidTypes[n.kind])[0],
            this.createSubContext(node, context)
        );
    }

    protected createSubContext(node: ts.TypeReferenceNode, parentContext: Context): Context {
        const subContext = new Context(node, parentContext);
        if (node.typeArguments && node.typeArguments.length) {
            for (const typeArg of node.typeArguments) {
                const type = this.childNodeParser.createType(typeArg, parentContext);
                subContext.pushArgument(type);
            }
        }

        return subContext;
    }
}
