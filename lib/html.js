var arrays_1 = require('./arrays');
var ElementProto = (typeof Element !== 'undefined' && Element.prototype) || {};
var matchesSelector = ElementProto.matches ||
    ElementProto.webkitMatchesSelector ||
    ElementProto.mozMatchesSelector ||
    ElementProto.msMatchesSelector ||
    ElementProto.oMatchesSelector || function (selector) {
    var nodeList = (this.parentNode || document).querySelectorAll(selector) || [];
    return !!~arrays_1.indexOf(nodeList, this);
};
var elementAddEventListener = ElementProto.addEventListener || function (eventName, listener) {
    return this.attachEvent('on' + eventName, listener);
};
var elementRemoveEventListener = ElementProto.removeEventListener || function (eventName, listener) {
    return this.detachEvent('on' + eventName, listener);
};
var transitionEndEvent = (function transitionEnd() {
    var el = document.createElement('bootstrap');
    var transEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd otransitionend',
        'transition': 'transitionend'
    };
    for (var name in transEndEventNames) {
        if (el.style[name] !== undefined) {
            return transEndEventNames[name];
        }
    }
    return null;
});
var animationEndEvent = (function animationEnd() {
    var el = document.createElement('bootstrap');
    var transEndEventNames = {
        'WebkitAnimation': 'webkitAnimationEnd',
        'MozAnimation': 'animationend',
        'OTransition': 'oAnimationEnd oanimationend',
        'animation': 'animationend'
    };
    for (var name in transEndEventNames) {
        if (el.style[name] !== undefined) {
            return transEndEventNames[name];
        }
    }
    return null;
});
function matches(elm, selector) {
    return matchesSelector.call(elm, selector);
}
exports.matches = matches;
function addEventListener(elm, eventName, listener, useCap) {
    if (useCap === void 0) { useCap = false; }
    elementAddEventListener.call(elm, eventName, listener, useCap);
}
exports.addEventListener = addEventListener;
function removeEventListener(elm, eventName, listener) {
    elementRemoveEventListener.call(elm, eventName, listener);
}
exports.removeEventListener = removeEventListener;
function addClass(elm, className) {
    if (elm.classList)
        elm.classList.add(className);
    else {
        elm.className = elm.className.split(' ').concat(className.split(' ')).join(' ');
    }
}
exports.addClass = addClass;
function removeClass(elm, className) {
    if (elm.classList)
        elm.classList.remove(className);
    else {
        var split = elm.className.split(' '), classNames = className.split(' '), tmp = split, index;
        for (var i = 0, ii = classNames.length; i < ii; i++) {
            index = split.indexOf(classNames[i]);
            if (!!~index)
                split = split.splice(index, 1);
        }
    }
}
exports.removeClass = removeClass;
function hasClass(elm, className) {
    if (elm.classList) {
        return elm.classList.contains(className);
    }
    var reg = new RegExp('\b' + className);
    return reg.test(elm.className);
}
exports.hasClass = hasClass;
function selectionStart(elm) {
    if ('selectionStart' in elm) {
        return elm.selectionStart;
    }
    else if (document.selection) {
        elm.focus();
        var sel = document.selection.createRange();
        var selLen = document.selection.createRange().text.length;
        sel.moveStart('character', -elm.value.length);
        return sel.text.length - selLen;
    }
}
exports.selectionStart = selectionStart;
var _events = {
    animationEnd: null,
    transitionEnd: null
};
function transitionEnd(elm, fn, ctx, duration) {
    var event = _events.transitionEnd || (_events.transitionEnd = transitionEndEvent());
    var callback = function (e) {
        removeEventListener(elm, event, callback);
        fn.call(ctx, e);
    };
    addEventListener(elm, event, callback);
}
exports.transitionEnd = transitionEnd;
function animationEnd(elm, fn, ctx, duration) {
    var event = _events.animationEnd || (_events.animationEnd = animationEndEvent());
    var callback = function (e) {
        removeEventListener(elm, event, callback);
        fn.call(ctx, e);
    };
    addEventListener(elm, event, callback);
}
exports.animationEnd = animationEnd;
exports.domReady = (function () {
    var fns = [], listener, doc = document, hack = doc.documentElement.doScroll, domContentLoaded = 'DOMContentLoaded', loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState);
    if (!loaded) {
        doc.addEventListener(domContentLoaded, listener = function () {
            doc.removeEventListener(domContentLoaded, listener);
            loaded = true;
            while (listener = fns.shift())
                listener();
        });
    }
    return function (fn) {
        loaded ? setTimeout(fn, 0) : fns.push(fn);
    };
})();
