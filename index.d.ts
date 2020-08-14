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
        targetValue: any;
        target: Target;
        source: Source;
    }

    export type FilterFunc = (data: FieldData) => boolean;
    export type OverwriteFunc = FilterFunc;

    export interface RenameMap {
        [field: string]: string;
    }

    export type ChangeFunc = (data: FieldData) => any;

    export interface Settings {
        copyFunc?: boolean;
        funcToProto?: boolean;
        processSymbol?: boolean;
        overwrite?: boolean | OverwriteFunc | RegExp;
        recursive?: boolean;
        mixFromArray?: boolean;
        mixToArray?: boolean;
        mixArray?: boolean;
        oneSource?: boolean;
        ownProperty?: boolean;
        copy?: string | string[] | RegExp | Symbol | FieldMap;
        except?: string | string[] | RegExp | Symbol | ExceptMap;
        filter?: FilterFunc | RegExp;
        otherName?: RenameMap;
        change?: ChangeFunc | FieldMap;
    }

    export function assign(destination: Target, ...source: Source[]): Target;
    export function change(source: Source, change: ChangeFunc): Source;
    export function copy(source: Source | Source[], settings?: Settings): object;
    export function mixToItems(destinationList: Target[], source: Source | Source[], settings?: Settings): Target[];
    export function clone(this: object, settings?: Settings): object;
    export function filter(this: object, filter: FilterFunc | Settings): object;
    export function map(this: object, change: ChangeFunc | Settings): object;
    export function mix(this: object, source: Source | Source[], settings?: Settings): object;
    export function update(this: object, change: ChangeFunc | FieldMap): object;
    export function getSettings(): Settings | null | undefined;
    export function setSettings(settings?: Settings | null): void;
}
