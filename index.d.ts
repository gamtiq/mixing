// Created on the basis of http://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-function-d-ts.html

export as namespace mixing;

export = Mixing;

declare function Mixing(
    destination: Mixing.Target,
    source: Mixing.Source | Mixing.Source[],
    settings?: Mixing.Settings
): Mixing.Target;

declare namespace Mixing {
    export type AnyFunc = (...args: any[]) => any;

    export type Source = object | any[] | AnyFunc | null | undefined;

    export type Target = Source;

    export interface FieldMap {
        [field: string]: any;
    }

    export interface ExceptMap {
        [field: string]: boolean;
    }

    export interface FieldData {
        field: string;
        value: any;
        target: Target;
        source: Source;
    }

    export type FilterFunc = (data: FieldData) => boolean;

    export interface RenameMap {
        [field: string]: string;
    }

    export type ChangeFunc = (data: FieldData) => any;

    export interface Settings {
        copyFunc?: boolean;
        funcToProto?: boolean;
        processSymbol?: boolean;
        overwrite?: boolean;
        recursive?: boolean;
        mixFromArray?: boolean;
        mixToArray?: boolean;
        oneSource?: boolean;
        ownProperty?: boolean;
        copy?: string | string[] | RegExp | Symbol | FieldMap;
        except?: string | string[] | RegExp | Symbol | ExceptMap;
        filter?: FilterFunc | RegExp;
        otherName?: RenameMap;
        change?: ChangeFunc | FieldMap;
    }

    export declare function assign(destination: Target, ...source: Source[]): Target;
    export declare function change(source: Source, change: ChangeFunc): Source;
    export declare function copy(source: Source | Source[], settings?: Settings): object;
    export declare function mixToItems(destinationList: Target[], source: Source | Source[], settings?: Settings): Target[];
    export declare function clone(this: object, settings?: Settings): object;
    export declare function filter(this: object, filter: FilterFunc | Settings): object;
    export declare function map(this: object, change: ChangeFunc | Settings): object;
    export declare function mix(this: object, source: Source | Source[], settings?: Settings): object;
    export declare function update(this: object, change: ChangeFunc | FieldMap): object;
    export declare function getSettings(): Settings | null | undefined;
    export declare function setSettings(settings?: Settings | null): void;
}
