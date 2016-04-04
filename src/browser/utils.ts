declare var process:any;

export enum Browser {
    Chrome, Explorer, Firefox, Safari, Opera, Unknown
}

const browser = (function () {
    let ua = navigator.userAgent;
    if (!!~ua.indexOf('MSIE')) return  Browser.Explorer;
    
    let isOpera = !!~ua.toLowerCase().indexOf('op'),
        isChrome = !!~ua.indexOf('Chrome'),
        isSafari = !!~ua.indexOf('Safari');
     
    if (isChrome && isSafari) return Browser.Safari;
    if (isChrome && isOpera) return Browser.Opera;
    if (isChrome) return Browser.Chrome;
    
    return Browser.Unknown;
    
})();

const is_node = (function () {
    try {
        return 'object' === typeof process && Object.prototype.toString.call(process) === '[object process]'
    } catch(e) {
        return false;
    }
})();

export function isNode() { return is_node; }

export function isSafari (): boolean {
    return browser === Browser.Safari;
}

export function isChrome (): boolean {
    return browser === Browser.Chrome;
}



