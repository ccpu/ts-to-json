import { AliasType } from "../Type/AliasType";
import { AnnotatedType } from "../Type/AnnotatedType";
import { BaseType } from "../Type/BaseType";
import { DefinitionType } from "../Type/DefinitionType";
import { ReferenceType } from "../Type/ReferenceType";

/**
 * Dereference the type as far as possible.
 */
export function derefType(type: BaseType): BaseType {
    if (type instanceof DefinitionType || type instanceof AliasType || type instanceof AnnotatedType) {
        // https://github.com/vega/ts-json-schema-generator/issues/192#issuecomment-597802304
        if (!(type as any).type) return type;
        return derefType(type.getType());
    }
    if (type instanceof ReferenceType && type.hasType()) {
        // https://github.com/vega/ts-json-schema-generator/issues/192#issuecomment-597802304
        if (!(type as any).type) return type;
        return derefType(type.getType());
    }

    return type;
}

export function derefAnnotatedType(type: BaseType): BaseType {
    if (type instanceof AnnotatedType || type instanceof AliasType) {
        return derefAnnotatedType(type.getType());
    }

    return type;
}
