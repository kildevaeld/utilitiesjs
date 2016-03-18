export declare function matches(elm: any, selector: any): boolean;
export declare function addEventListener(elm: Element, eventName: string, listener: any, useCap?: boolean): void;
export declare function removeEventListener(elm: Element, eventName: string, listener: any): void;
export declare function delegate(elm: HTMLElement | string, selector: string, eventName: string, callback: any, ctx?: any): Function;
export declare function undelegate(elm: HTMLElement | string, selector: string, eventName: string, callback: any): void;
export declare function addClass(elm: HTMLElement, className: string): void;
export declare function removeClass(elm: HTMLElement, className: string): void;
export declare function hasClass(elm: HTMLElement, className: string): boolean;
export declare function selectionStart(elm: HTMLInputElement): number;
export declare function transitionEnd(elm: Element, fn: (event: TransitionEvent) => void, ctx?: any, duration?: number): void;
export declare function animationEnd(elm: Element, fn: (event: AnimationEvent) => void, ctx?: any, duration?: number): void;
export declare const domReady: () => (fn: any) => void;
export declare class Html {
    static query(query: string | HTMLElement | NodeList, context?: string | HTMLElement | NodeList): Html;
    private _elements;
    length: number;
    constructor(el: HTMLElement[]);
    get(n: number): HTMLElement;
    addClass(str: string): Html;
    removeClass(str: string): Html;
    hasClass(str: string): boolean;
    attr(key: string | Object, value?: any): Html | string;
    text(str: string): any;
    html(html: string): any;
    parent(): Html;
    find(str: string): Html;
    map<T>(fn: (elm: HTMLElement, index?: number) => T): T[];
    forEach(fn: (elm: HTMLElement, index: number) => void): Html;
}
