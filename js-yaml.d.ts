declare module 'js-yaml' {
    export function load(str: string, options?: any): any;
    export function dump(obj: any, options?: any): string;
    const _default: {
        load: typeof load;
        dump: typeof dump;
    };
    export default _default;
}
