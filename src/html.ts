
import {indexOf, unique, slice} from './arrays'
import {isObject} from './objects';

var ElementProto: any = (typeof Element !== 'undefined' && Element.prototype) || {};

var matchesSelector = ElementProto.matches ||
  ElementProto.webkitMatchesSelector ||
  ElementProto.mozMatchesSelector ||
  ElementProto.msMatchesSelector ||
  ElementProto.oMatchesSelector || function(selector) {
    var nodeList = (this.parentNode || document).querySelectorAll(selector) || [];
    return !!~indexOf(nodeList, this);
  }

var elementAddEventListener = ElementProto.addEventListener || function(eventName, listener) {
  return this.attachEvent('on' + eventName, listener);
}
var elementRemoveEventListener = ElementProto.removeEventListener || function(eventName, listener) {
  return this.detachEvent('on' + eventName, listener);
}

const transitionEndEvent = (function transitionEnd() {
  var el = document.createElement('bootstrap')

  var transEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd otransitionend',
    'transition': 'transitionend'
  }

  for (var name in transEndEventNames) {
    if (el.style[name] !== undefined) {
      return transEndEventNames[name]
    }
  }

  return null
});

const animationEndEvent = (function animationEnd() {
  var el = document.createElement('bootstrap')

  var transEndEventNames = {
    'WebkitAnimation': 'webkitAnimationEnd',
    'MozAnimation': 'animationend',
    'OAnimation': 'oAnimationEnd oanimationend',
    'animation': 'animationend'
  }

  for (var name in transEndEventNames) {
    if (el.style[name] !== undefined) {
      return transEndEventNames[name]
    }
  }

  return null
});


export function matches(elm, selector): boolean {
  return matchesSelector.call(elm, selector)
}

export function addEventListener(elm: Element, eventName: string, listener, useCap: boolean = false) {
  elementAddEventListener.call(elm, eventName, listener, useCap)
}

export function removeEventListener(elm: Element, eventName: string, listener) {
  elementRemoveEventListener.call(elm, eventName, listener)
}

const unbubblebles = 'focus blur change'.split(' ');
let domEvents = [];

export function delegate(elm: HTMLElement | string, selector: string, eventName: string, callback, ctx?): Function {
  let root = elm
  let handler = function(e) {
    let node = e.target || e.srcElement;

    // Already handled
    if (e.delegateTarget) return;

    for (; node && node != root; node = node.parentNode) {
      if (matches(node, selector)) {

        e.delegateTarget = node;
        callback(e);
      }
    }
  }

  let useCap = !!~unbubblebles.indexOf(eventName)
  addEventListener(<HTMLElement>elm, eventName, handler, useCap);
  domEvents.push({ eventName: eventName, handler: handler, listener: callback, selector: selector });
  return handler;
}

export function undelegate(elm: HTMLElement | string, selector: string, eventName: string, callback) {
  /*if (typeof selector === 'function') {
      listener = <Function>selector;
      selector = null;
    }*/

  var handlers = domEvents.slice();
  for (var i = 0, len = handlers.length; i < len; i++) {
    var item = handlers[i];

    var match = item.eventName === eventName &&
      (callback ? item.listener === callback : true) &&
      (selector ? item.selector === selector : true);

    if (!match) continue;

    removeEventListener(<HTMLElement>elm, item.eventName, item.handler);
    domEvents.splice(indexOf(handlers, item), 1);
  }
}


export function addClass(elm: HTMLElement, className: string) {
  if (elm.classList) {
    let split = className.split(' ');
    for (let i = 0, ii = split.length; i < ii;i++) {
      if (elm.classList.contains(split[i].trim())) continue;
      elm.classList.add(split[i].trim());
    }
  } else {
    elm.className = unique(elm.className.split(' ').concat(className.split(' '))).join(' ')
  }
}
export function removeClass(elm: HTMLElement, className: string) {
  if (elm.classList) {
    let split = className.split(' ');
    for (let i = 0, ii = split.length; i < ii; i++) {
      elm.classList.remove(split[i].trim());
    }
  } else {
    let split = elm.className.split(' '),
      classNames = className.split(' '),
      tmp = split, index

    for (let i = 0, ii = classNames.length; i < ii; i++) {
      index = split.indexOf(classNames[i])
      if (!!~index) split = split.splice(index, 1)
    }
  }
}

export function hasClass(elm: HTMLElement, className: string) {
  if (elm.classList) {
    return elm.classList.contains(className);
  }
  var reg = new RegExp('\b' + className)
  return reg.test(elm.className)
}

export function selectionStart(elm: HTMLInputElement): number {
  if ('selectionStart' in elm) {
    // Standard-compliant browsers
    return elm.selectionStart;
  } else if ((<any>document).selection) {
    // IE
    elm.focus();
    var sel = (<any>document).selection.createRange();
    var selLen = (<any>document).selection.createRange().text.length;
    sel.moveStart('character', -elm.value.length);
    return sel.text.length - selLen;
  }
}

var _events = {
  animationEnd: null,
  transitionEnd: null
};

export function transitionEnd(elm: Element, fn: (event: TransitionEvent) => void, ctx?: any, duration?: number) {
  var event = _events.transitionEnd || (_events.transitionEnd = transitionEndEvent());
  var callback = function(e) {
    removeEventListener(elm, event, callback);
    fn.call(ctx, e);
  };
  addEventListener(elm, event, callback);
}

export function animationEnd(elm: Element, fn: (event: AnimationEvent) => void, ctx?: any, duration?: number) {
  var event = _events.animationEnd || (_events.animationEnd = animationEndEvent());
  var callback = function(e) {
    removeEventListener(elm, event, callback);
    fn.call(ctx, e);
  };
  addEventListener(elm, event, callback);
}

export const domReady = (function() {
  var fns = [], listener
    , doc = document
    , hack = (<any>doc.documentElement).doScroll
    , domContentLoaded = 'DOMContentLoaded'
    , loaded: boolean = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)


  if (!loaded) {
    doc.addEventListener(domContentLoaded, listener = function() {
      doc.removeEventListener(domContentLoaded, listener)
      loaded = true

      while (listener = fns.shift()) listener()
    })
  }

  return function(fn) {
    loaded ? setTimeout(fn, 0) : fns.push(fn)
  }
});



export class Html {

  static query(query: string | HTMLElement | NodeList, context?: string | HTMLElement | NodeList): Html {
    if (typeof context === 'string') {
      context = document.querySelectorAll(<string>context);
    }
    let html: Html;
    let els: HTMLElement[];
    if (typeof query === 'string') {
      if (context) {
        if (context instanceof HTMLElement) {
          els = slice(context.querySelectorAll(query));
        } else {
          html = new Html(slice(context));
          return html.find(query);
        }
      } else {
        els = slice(document.querySelectorAll(query));
      }
    } else if (query && query instanceof Element) {
      els = [query];
    } else if (query && query instanceof NodeList) {
      els = slice(query);
    }

    return new Html(els);
  }

  private _elements: HTMLElement[];

  get length(): number {
    return this._elements.length;
  }

  constructor(el: HTMLElement[]) {
    if (!Array.isArray(el)) el = [<any>el]
    this._elements = el || [];
  }

  get(n: number): HTMLElement {
    n = n === undefined ? 0 : n;
    return n >= this.length ? undefined : this._elements[n];
  }

  addClass(str: string): Html {
    return this.forEach((e) => {
      addClass(e, str);
    });
  }

  removeClass(str: string): Html {
    return this.forEach((e) => {
      removeClass(e, str);
    });
  }

  hasClass(str: string): boolean {
    return this._elements.reduce<boolean>((p, c) => {
      return hasClass(c, str);
    }, false);
  }

  attr(key: string | Object, value?: any): Html | string {
    let attr;
    if (typeof key === 'string' && value) {
      attr = { [key]: value };
    } else if (typeof key == 'string') {
      if (this.length) return this.get(0).getAttribute(<string>key);
    } else if (isObject(key)) {
      attr = key;
    }
    return this.forEach(e => {
      for (let k in attr) {
        e.setAttribute(k, attr[k]);
      }
    });
  }

  parent(): Html {
    var out = [];
    this.forEach(e => {
      if (e.parentElement) {
        out.push(e.parentElement);
      }
    })
    return new Html(out);
  }

  find(str: string): Html {
    var out = [];
    this.forEach(e => {
      out = out.concat(slice(e.querySelectorAll(str)));
    });
    return new Html(out);
  }

  map<T>(fn: (elm: HTMLElement, index?:number) => T): T[] {
    let out: T[] = new Array(this.length)
    this.forEach((e, i) => {
      out[i] = fn(e, i);
    });
    return out;
  }

  forEach(fn: (elm: HTMLElement, index: number) => void): Html {
    this._elements.forEach(fn);
    return this;
  }
}