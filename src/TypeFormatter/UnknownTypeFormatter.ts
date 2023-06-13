import { Config } from "../Config";
import { Definition } from "../Schema/Definition";
import { SubTypeFormatter } from "../SubTypeFormatter";
import { BaseType } from "../Type/BaseType";
import { UnknownType } from "../Type/UnknownType";

export class UnknownTypeFormatter implements SubTypeFormatter {
    public constructor(private config: Config) {}

    public supportsType(type: UnknownType): boolean {
        return type instanceof UnknownType;
    }
    public getDefinition(type: UnknownType): Definition {
        if (this.config.allowArbitraryDataTypes) {
            return { type: "unknown" as "string" };
        } else {
            return {
                $comment: type.getComment(),
            };
        }
    }
    public getChildren(type: UnknownType): BaseType[] {
        return [];
    }
}
