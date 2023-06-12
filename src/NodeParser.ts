import stringify from "safe-stable-stringify";
import ts from "typescript";
import { BaseType } from "./Type/BaseType";
import { ReferenceType } from "./Type/ReferenceType";
import { getKey, ignoreLimits, hasLimitOptions } from "./Utils";
import { Config } from "./Config";

export class Context {
    private cacheKey: string | null = null;
    private arguments: BaseType[] = [];
    private parameters: string[] = [];
    private reference?: ts.Node;
    private defaultArgument = new Map<string, BaseType | undefined>();
    private parentContext?: Context;
    public ignoreLimits? = false;
    private skipNode: ts.Node;
    public isParameter = false;

    public constructor(reference?: ts.Node, parentContext?: Context) {
        this.reference = reference;
        this.parentContext = parentContext;
    }

    public pushArgument(argumentType: BaseType): void {
        this.arguments.push(argumentType);
        this.cacheKey = null;
    }

    public pushParameter(parameterName: string): void {
        this.parameters.push(parameterName);
    }

    public setDefault(parameterName: string, argumentType: BaseType | undefined): void {
        this.defaultArgument.set(parameterName, argumentType);
    }

    public getCacheKey(config?: Config) {
        if (this.cacheKey == null) {
            this.cacheKey = stringify([
                this.reference ? getKey(this.reference, this) : "",
                this.arguments.map((argument) => argument?.getId()),

                this.parentContext?.reference &&
                this.parentContext.reference.kind === ts.SyntaxKind.ExpressionWithTypeArguments
                    ? ts.SyntaxKind.ExpressionWithTypeArguments
                    : "",
                hasLimitOptions(config) && ignoreLimits(this) ? "recursion" : "",
            ]);
        }
        return this.cacheKey;
    }

    public getArgument(parameterName: string): BaseType {
        const index: number = this.parameters.indexOf(parameterName);

        if ((index < 0 || !this.arguments[index]) && this.defaultArgument.has(parameterName)) {
            return this.defaultArgument.get(parameterName)!;
        }

        return this.arguments[index]!;
    }

    public getParameters(): readonly string[] {
        return this.parameters;
    }

    public getArguments(): readonly BaseType[] {
        return this.arguments;
    }

    public getReference(): ts.Node | undefined {
        return this.reference;
    }

    public getParentContext() {
        return this.parentContext;
    }

    public hasParentContext() {
        return this.parentContext !== undefined;
    }

    public hasParentContextRecreance() {
        return this.parentContext !== undefined && this.parentContext.reference !== undefined;
    }

    public setSkipNode(node: ts.Node) {
        this.skipNode = node;
        return this;
    }
    public getSkipNode() {
        return this.skipNode;
    }
}

export interface NodeParser {
    createType(node: ts.Node, context: Context, reference?: ReferenceType): BaseType;
}
