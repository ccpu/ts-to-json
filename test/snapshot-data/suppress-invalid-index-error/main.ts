export interface MyGeneric<T extends { a?: string; b: number }> {
    a: T["a"];
    b: T["b"];
}

export type MyObject = MyGeneric<{ b: number }>;
