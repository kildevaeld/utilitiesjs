"use strict";
(function (Browser) {
    Browser[Browser["Chrome"] = 0] = "Chrome";
    Browser[Browser["Explorer"] = 1] = "Explorer";
    Browser[Browser["Firefox"] = 2] = "Firefox";
    Browser[Browser["Safari"] = 3] = "Safari";
    Browser[Browser["Opera"] = 4] = "Opera";
    Browser[Browser["Unknown"] = 5] = "Unknown";
})(exports.Browser || (exports.Browser = {}));
var Browser = exports.Browser;
var browser = (function () {
    var ua = navigator.userAgent;
    if (!!~ua.indexOf('MSIE'))
        return Browser.Explorer;
    var isOpera = !!~ua.toLowerCase().indexOf('op'), isChrome = !!~ua.indexOf('Chrome'), isSafari = !!~ua.indexOf('Safari');
    if (isChrome && isSafari)
        return Browser.Safari;
    if (isChrome && isOpera)
        return Browser.Opera;
    if (isChrome)
        return Browser.Chrome;
    return Browser.Unknown;
})();
var is_node = (function () {
    try {
        return 'object' === typeof process && Object.prototype.toString.call(process) === '[object process]';
    }
    catch (e) {
        return false;
    }
})();
function isNode() { return is_node; }
exports.isNode = isNode;
function isSafari() {
    return browser === Browser.Safari;
}
exports.isSafari = isSafari;
function isChrome() {
    return browser === Browser.Chrome;
}
exports.isChrome = isChrome;
