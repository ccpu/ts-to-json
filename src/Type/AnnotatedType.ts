import { BaseType } from "./BaseType";
import { hash } from "../Utils/nodeKey";
import { deepMerge } from "../Utils/deepMerge2";
import { AliasType } from "./AliasType";

export interface Annotations {
    [name: string]: any;
}

const getAnnotations = (data: Annotations): any => {
    const annotation = data.annotations;

    if (annotation && "discriminator" in annotation) {
        return annotation;
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    if (data.type && (data.type instanceof AnnotatedType || data.type instanceof AliasType)) {
        const refAnnotations = getAnnotations(data.type);

        const mergedAnnotations = deepMerge(refAnnotations, annotation || {});

        return mergedAnnotations;
    }
    return annotation;
};

export class AnnotatedType extends BaseType {
    public constructor(private type: BaseType, private annotations: Annotations, private nullable: boolean) {
        super();
    }

    public getId(): string {
        return this.type.getId() + hash([this.isNullable(), this.annotations]);
    }

    public getType(): BaseType {
        return this.type;
    }
    public getAnnotations(): Annotations {
        return getAnnotations(this);
    }
    public isNullable(): boolean {
        return this.nullable;
    }
}
