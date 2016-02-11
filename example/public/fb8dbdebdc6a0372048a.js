/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	var Request = __webpack_require__(1);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var utils_1 = __webpack_require__(2);
	var promises_1 = __webpack_require__(6);
	var xmlRe = /^(?:application|text)\/xml/, jsonRe = /^application\/json/, fileProto = /^file:/;
	function queryParam(obj) {
	    return '?' + Object.keys(obj).reduce(function (a, k) { a.push(k + '=' + encodeURIComponent(obj[k])); return a; }, []).join('&');
	}
	exports.queryParam = queryParam;
	var isValid = function (xhr, url) {
	    return (xhr.status >= 200 && xhr.status < 300) ||
	        (xhr.status === 304) ||
	        (xhr.status === 0 && fileProto.test(url)) ||
	        (xhr.status === 0 && window.location.protocol === 'file:');
	};
	var Request = (function () {
	    function Request(_method, _url) {
	        this._method = _method;
	        this._url = _url;
	        this._xhr = utils_1.ajax();
	    }
	    Request.prototype.send = function (data) {
	        this._data = data;
	        return this;
	    };
	    Request.prototype.withCredentials = function (ret) {
	        this._xhr.withCredentials = ret;
	        return this;
	    };
	    Request.prototype.end = function (data) {
	        var _this = this;
	        this._data = data || this._data;
	        var defer = promises_1.deferred();
	        this._xhr.addEventListener('readystatechange', function () {
	            if (_this._xhr.readyState !== XMLHttpRequest.DONE)
	                return;
	            if (!isValid(_this._xhr, _this._url)) {
	                return defer.reject(new Error('server responded with: ' + _this._xhr.status));
	            }
	            defer.resolve(_this._xhr.responseText);
	        });
	        data = this._data;
	        var url = this._url;
	        if (data && data === Object(data)) {
	            var d = queryParam(data);
	            url += d;
	        }
	        this._xhr.open(this._method, url, true);
	        this._xhr.send(data);
	        return defer.promise;
	    };
	    Request.prototype.json = function (data) {
	        var _this = this;
	        return this.end(data)
	            .then(function (str) {
	            var accepts = _this._xhr.getResponseHeader('content-type');
	            if (jsonRe.test(accepts) && str !== '') {
	                var json = JSON.parse(str);
	                return json;
	            }
	            else {
	                throw new Error('json');
	            }
	        });
	    };
	    Request.prototype.progress = function (fn) {
	        this._xhr.addEventListener('progress', fn);
	        return this;
	    };
	    Request.prototype.header = function (field, value) {
	        this._xhr.setRequestHeader(field, value);
	        return this;
	    };
	    return Request;
	})();
	exports.Request = Request;
	(function (HttpMethod) {
	    HttpMethod[HttpMethod["Get"] = 0] = "Get";
	    HttpMethod[HttpMethod["Post"] = 1] = "Post";
	    HttpMethod[HttpMethod["Put"] = 2] = "Put";
	    HttpMethod[HttpMethod["Delete"] = 3] = "Delete";
	    HttpMethod[HttpMethod["Patch"] = 4] = "Patch";
	    HttpMethod[HttpMethod["Head"] = 5] = "Head";
	})(exports.HttpMethod || (exports.HttpMethod = {}));
	var HttpMethod = exports.HttpMethod;
	exports.request = {};
	['get', 'post', 'put', 'delete', 'patch', 'head']
	    .forEach(function (m) {
	    exports.request[m === 'delete' ? 'del' : m] = function (url) {
	        return new Request(m.toUpperCase(), url);
	    };
	});


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var objects_1 = __webpack_require__(3);
	var arrays_1 = __webpack_require__(4);
	var strings_1 = __webpack_require__(5);
	var idCounter = 0;
	var nativeBind = Function.prototype.bind;
	function ajax() {
	    var e;
	    if (window.hasOwnProperty('XMLHttpRequest')) {
	        return new XMLHttpRequest();
	    }
	    try {
	        return new ActiveXObject('msxml2.xmlhttp.6.0');
	    }
	    catch (_error) {
	        e = _error;
	    }
	    try {
	        return new ActiveXObject('msxml2.xmlhttp.3.0');
	    }
	    catch (_error) {
	        e = _error;
	    }
	    try {
	        return new ActiveXObject('msxml2.xmlhttp');
	    }
	    catch (_error) {
	        e = _error;
	    }
	    return e;
	}
	exports.ajax = ajax;
	;
	function uniqueId(prefix) {
	    if (prefix === void 0) { prefix = ''; }
	    return prefix + (++idCounter);
	}
	exports.uniqueId = uniqueId;
	function proxy(from, to, fns) {
	    if (!Array.isArray(fns))
	        fns = [fns];
	    fns.forEach(function (fn) {
	        if (typeof to[fn] === 'function') {
	            from[fn] = bind(to[fn], to);
	        }
	    });
	}
	exports.proxy = proxy;
	function bind(method, context) {
	    var args = [];
	    for (var _i = 2; _i < arguments.length; _i++) {
	        args[_i - 2] = arguments[_i];
	    }
	    if (typeof method !== 'function')
	        throw new Error('method not at function');
	    if (nativeBind != null)
	        return nativeBind.call.apply(nativeBind, [method, context].concat(args));
	    args = args || [];
	    var fnoop = function () { };
	    var fBound = function () {
	        var ctx = this instanceof fnoop ? this : context;
	        return callFunc(method, ctx, args.concat(arrays_1.slice(arguments)));
	    };
	    fnoop.prototype = this.prototype;
	    fBound.prototype = new fnoop();
	    return fBound;
	}
	exports.bind = bind;
	function callFunc(fn, ctx, args) {
	    if (args === void 0) { args = []; }
	    switch (args.length) {
	        case 0:
	            return fn.call(ctx);
	        case 1:
	            return fn.call(ctx, args[0]);
	        case 2:
	            return fn.call(ctx, args[0], args[1]);
	        case 3:
	            return fn.call(ctx, args[0], args[1], args[2]);
	        case 4:
	            return fn.call(ctx, args[0], args[1], args[2], args[3]);
	        case 5:
	            return fn.call(ctx, args[0], args[1], args[2], args[3], args[4]);
	        default:
	            return fn.apply(ctx, args);
	    }
	}
	exports.callFunc = callFunc;
	function equal(a, b) {
	    return eq(a, b, [], []);
	}
	exports.equal = equal;
	function triggerMethodOn(obj, eventName, args) {
	    var ev = strings_1.camelcase("on-" + eventName.replace(':', '-'));
	    if (obj[ev] && typeof obj[ev] === 'function') {
	        callFunc(obj[ev], obj, args);
	    }
	    if (typeof obj.trigger === 'function') {
	        args = [eventName].concat(args);
	        callFunc(obj.trigger, obj, args);
	    }
	}
	exports.triggerMethodOn = triggerMethodOn;
	function getOption(option, objs) {
	    for (var _i = 0; _i < objs.length; _i++) {
	        var o = objs[_i];
	        if (objects_1.isObject(o) && o[option])
	            return o[option];
	    }
	    return null;
	}
	exports.getOption = getOption;
	function inherits(parent, protoProps, staticProps) {
	    var child;
	    if (protoProps && objects_1.has(protoProps, 'constructor')) {
	        child = protoProps.constructor;
	    }
	    else {
	        child = function () { return parent.apply(this, arguments); };
	    }
	    objects_1.extend(child, parent, staticProps);
	    var Surrogate = function () { this.constructor = child; };
	    Surrogate.prototype = parent.prototype;
	    child.prototype = new Surrogate;
	    if (protoProps)
	        objects_1.extend(child.prototype, protoProps);
	    child.__super__ = parent.prototype;
	    return child;
	}
	exports.inherits = inherits;
	exports.nextTick = (function () {
	    var canSetImmediate = typeof window !== 'undefined'
	        && window.setImmediate;
	    var canPost = typeof window !== 'undefined'
	        && window.postMessage && window.addEventListener;
	    if (canSetImmediate) {
	        return function (f) { return window.setImmediate(f); };
	    }
	    if (canPost) {
	        var queue = [];
	        window.addEventListener('message', function (ev) {
	            var source = ev.source;
	            if ((source === window || source === null) && ev.data === 'process-tick') {
	                ev.stopPropagation();
	                if (queue.length > 0) {
	                    var fn = queue.shift();
	                    fn();
	                }
	            }
	        }, true);
	        return function nextTick(fn) {
	            queue.push(fn);
	            window.postMessage('process-tick', '*');
	        };
	    }
	    return function nextTick(fn) {
	        setTimeout(fn, 0);
	    };
	})();
	function eq(a, b, aStack, bStack) {
	    if (a === b)
	        return a !== 0 || 1 / a == 1 / b;
	    if (a == null || b == null)
	        return a === b;
	    var className = toString.call(a);
	    if (className != toString.call(b))
	        return false;
	    switch (className) {
	        case '[object String]':
	            return a == String(b);
	        case '[object Number]':
	            return a !== +a ? b !== +b : (a === 0 ? 1 / a === 1 / b : a === +b);
	        case '[object Date]':
	        case '[object Boolean]':
	            return +a == +b;
	        case '[object RegExp]':
	            return a.source == b.source &&
	                a.global == b.global &&
	                a.multiline == b.multiline &&
	                a.ignoreCase == b.ignoreCase;
	    }
	    if (typeof a != 'object' || typeof b != 'object')
	        return false;
	    var length = aStack.length;
	    while (length--) {
	        if (aStack[length] == a)
	            return bStack[length] == b;
	    }
	    var aCtor = a.constructor, bCtor = b.constructor;
	    if (aCtor !== bCtor && !(typeof aCtor === 'function' && (aCtor instanceof aCtor) &&
	        typeof bCtor === 'function' && (bCtor instanceof bCtor))) {
	        return false;
	    }
	    aStack.push(a);
	    bStack.push(b);
	    var size = 0, result = true;
	    if (className === '[object Array]') {
	        size = a.length;
	        result = size === b.length;
	        if (result) {
	            while (size--) {
	                if (!(result = eq(a[size], b[size], aStack, bStack)))
	                    break;
	            }
	        }
	    }
	    else {
	        for (var key in a) {
	            if (objects_1.has(a, key)) {
	                size++;
	                if (!(result = objects_1.has(b, key) && eq(a[key], b[key], aStack, bStack)))
	                    break;
	            }
	        }
	        if (result) {
	            for (key in b) {
	                if (objects_1.has(b, key) && !(size--))
	                    break;
	            }
	            result = !size;
	        }
	    }
	    aStack.pop();
	    bStack.pop();
	    return result;
	}
	;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var utils_1 = __webpack_require__(2);
	var arrays_1 = __webpack_require__(4);
	function isObject(obj) {
	    return obj === Object(obj);
	}
	exports.isObject = isObject;
	function isEmpty(obj) {
	    return Object.keys(obj).length === 0;
	}
	exports.isEmpty = isEmpty;
	function extend(obj) {
	    var args = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        args[_i - 1] = arguments[_i];
	    }
	    if (!isObject(obj))
	        return obj;
	    var o, k;
	    for (var _a = 0; _a < args.length; _a++) {
	        o = args[_a];
	        if (!isObject(o))
	            continue;
	        for (k in o) {
	            if (has(o, k))
	                obj[k] = o[k];
	        }
	    }
	    return obj;
	}
	exports.extend = extend;
	function assign(target) {
	    var args = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        args[_i - 1] = arguments[_i];
	    }
	    if (target === undefined || target === null) {
	        throw new TypeError('Cannot convert first argument to object');
	    }
	    var to = Object(target);
	    for (var i = 0, ii = args.length; i < ii; i++) {
	        var nextSource = args[i];
	        if (nextSource === undefined || nextSource === null) {
	            continue;
	        }
	        nextSource = Object(nextSource);
	        var keysArray = Object.keys(Object(nextSource));
	        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
	            var nextKey = keysArray[nextIndex];
	            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
	            if (desc !== undefined && desc.enumerable) {
	                to[nextKey] = nextSource[nextKey];
	            }
	        }
	    }
	    return to;
	}
	exports.assign = assign;
	function has(obj, prop) {
	    return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	exports.has = has;
	function pick(obj, props) {
	    var out = {}, prop;
	    for (var _i = 0; _i < props.length; _i++) {
	        prop = props[_i];
	        if (has(obj, prop))
	            out[prop] = obj[prop];
	    }
	    return out;
	}
	exports.pick = pick;
	function result(obj, prop, ctx, args) {
	    var ret = obj[prop];
	    return (typeof ret === 'function') ? utils_1.callFunc(ret, ctx, args || []) : ret;
	}
	exports.result = result;
	function values(obj) {
	    var output = [];
	    for (var k in obj)
	        if (has(obj, k)) {
	            output.push(obj[k]);
	        }
	    return output;
	}
	exports.values = values;
	function intersectionObjects(a, b, predicate) {
	    var results = [], aElement, existsInB;
	    for (var i = 0, ii = a.length; i < ii; i++) {
	        aElement = a[i];
	        existsInB = arrays_1.any(b, function (bElement) { return predicate(bElement, aElement); });
	        if (existsInB) {
	            results.push(aElement);
	        }
	    }
	    return results;
	}
	function intersection(results) {
	    var args = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        args[_i - 1] = arguments[_i];
	    }
	    var lastArgument = args[args.length - 1];
	    var arrayCount = args.length;
	    var areEqualFunction = utils_1.equal;
	    if (typeof lastArgument === "function") {
	        areEqualFunction = lastArgument;
	        arrayCount--;
	    }
	    for (var i = 0; i < arrayCount; i++) {
	        var array = args[i];
	        results = intersectionObjects(results, array, areEqualFunction);
	        if (results.length === 0)
	            break;
	    }
	    return results;
	}
	exports.intersection = intersection;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var utils_1 = __webpack_require__(2);
	function unique(array) {
	    return array.filter(function (e, i) {
	        for (i += 1; i < array.length; i += 1) {
	            if (utils_1.equal(e, array[i])) {
	                return false;
	            }
	        }
	        return true;
	    });
	}
	exports.unique = unique;
	function any(array, predicate) {
	    for (var i = 0, ii = array.length; i < ii; i++) {
	        if (predicate(array[i]))
	            return true;
	    }
	    return false;
	}
	exports.any = any;
	function indexOf(array, item) {
	    for (var i = 0, len = array.length; i < len; i++)
	        if (array[i] === item)
	            return i;
	    return -1;
	}
	exports.indexOf = indexOf;
	function find(array, callback, ctx) {
	    var v;
	    for (var i = 0, ii = array.length; i < ii; i++) {
	        if (callback.call(ctx, array[i]))
	            return array[i];
	    }
	    return null;
	}
	exports.find = find;
	function slice(array, begin, end) {
	    return Array.prototype.slice.call(array, begin, end);
	}
	exports.slice = slice;
	function flatten(arr) {
	    return arr.reduce(function (flat, toFlatten) {
	        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
	    }, []);
	}
	exports.flatten = flatten;
	function sortBy(obj, value, context) {
	    var iterator = typeof value === 'function' ? value : function (obj) { return obj[value]; };
	    return obj
	        .map(function (value, index, list) {
	        return {
	            value: value,
	            index: index,
	            criteria: iterator.call(context, value, index, list)
	        };
	    })
	        .sort(function (left, right) {
	        var a = left.criteria, b = right.criteria;
	        if (a !== b) {
	            if (a > b || a === void 0)
	                return 1;
	            if (a < b || b === void 0)
	                return -1;
	        }
	        return left.index - right.index;
	    })
	        .map(function (item) {
	        return item.value;
	    });
	}
	exports.sortBy = sortBy;


/***/ },
/* 5 */
/***/ function(module, exports) {

	function camelcase(input) {
	    return input.toLowerCase().replace(/-(.)/g, function (match, group1) {
	        return group1.toUpperCase();
	    });
	}
	exports.camelcase = camelcase;
	;
	function truncate(str, length) {
	    var n = str.substring(0, Math.min(length, str.length));
	    return n + (n.length == str.length ? '' : '...');
	}
	exports.truncate = truncate;
	function humanFileSize(bytes, si) {
	    if (si === void 0) { si = false; }
	    var thresh = si ? 1000 : 1024;
	    if (Math.abs(bytes) < thresh) {
	        return bytes + ' B';
	    }
	    var units = si
	        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	    var u = -1;
	    do {
	        bytes /= thresh;
	        ++u;
	    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
	    return bytes.toFixed(1) + ' ' + units[u];
	}
	exports.humanFileSize = humanFileSize;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var objects_1 = __webpack_require__(3);
	var arrays_1 = __webpack_require__(4);
	var utils_1 = __webpack_require__(2);
	exports.Promise = (typeof window === 'undefined') ? global.Promise : window.Promise;
	function isPromise(obj) {
	    return obj && typeof obj.then === 'function';
	}
	exports.isPromise = isPromise;
	function toPromise(obj) {
	    if (!obj) {
	        return obj;
	    }
	    if (isPromise(obj)) {
	        return obj;
	    }
	    if ("function" == typeof obj) {
	        return thunkToPromise.call(this, obj);
	    }
	    if (Array.isArray(obj)) {
	        return arrayToPromise.call(this, obj);
	    }
	    if (objects_1.isObject(obj)) {
	        return objectToPromise.call(this, obj);
	    }
	    return exports.Promise.resolve(obj);
	}
	exports.toPromise = toPromise;
	function thunkToPromise(fn) {
	    var ctx = this;
	    return new exports.Promise(function (resolve, reject) {
	        fn.call(ctx, function (err, res) {
	            if (err)
	                return reject(err);
	            if (arguments.length > 2)
	                res = arrays_1.slice(arguments, 1);
	            resolve(res);
	        });
	    });
	}
	exports.thunkToPromise = thunkToPromise;
	function arrayToPromise(obj) {
	    return exports.Promise.all(obj.map(toPromise, this));
	}
	exports.arrayToPromise = arrayToPromise;
	function objectToPromise(obj) {
	    var results = new obj.constructor();
	    var keys = Object.keys(obj);
	    var promises = [];
	    for (var i = 0; i < keys.length; i++) {
	        var key = keys[i];
	        var promise = toPromise.call(this, obj[key]);
	        if (promise && isPromise(promise))
	            defer(promise, key);
	        else
	            results[key] = obj[key];
	    }
	    return exports.Promise.all(promises).then(function () {
	        return results;
	    });
	    function defer(promise, key) {
	        results[key] = undefined;
	        promises.push(promise.then(function (res) {
	            results[key] = res;
	        }));
	    }
	}
	exports.objectToPromise = objectToPromise;
	function deferred(fn, ctx) {
	    var args = [];
	    for (var _i = 2; _i < arguments.length; _i++) {
	        args[_i - 2] = arguments[_i];
	    }
	    var ret = {};
	    ret.promise = new exports.Promise(function (resolve, reject) {
	        ret.resolve = resolve;
	        ret.reject = reject;
	        ret.done = function (err, result) { if (err)
	            return reject(err);
	        else
	            resolve(result); };
	    });
	    if (typeof fn === 'function') {
	        utils_1.callFunc(fn, ctx, args.concat([ret.done]));
	        return ret.promise;
	    }
	    return ret;
	}
	exports.deferred = deferred;
	;
	function callback(promise, callback, ctx) {
	    promise.then(function (result) {
	        callback.call(ctx, null, result);
	    }).catch(function (err) {
	        callback.call(ctx, err);
	    });
	}
	exports.callback = callback;
	function delay(timeout) {
	    var defer = deferred();
	    timeout == null ? utils_1.nextTick(defer.resolve) : setTimeout(defer.resolve, timeout);
	    return defer.promise;
	}
	exports.delay = delay;
	;
	function eachAsync(array, iterator, context, accumulate) {
	    if (accumulate === void 0) { accumulate = false; }
	    return mapAsync(array, iterator, context, accumulate)
	        .then(function () { return void 0; });
	}
	exports.eachAsync = eachAsync;
	function mapAsync(array, iterator, context, accumulate) {
	    if (accumulate === void 0) { accumulate = false; }
	    return new exports.Promise(function (resolve, reject) {
	        var i = 0, len = array.length, errors = [], results = [];
	        function next(err, result) {
	            if (err && !accumulate)
	                return reject(err);
	            if (err)
	                errors.push(err);
	            if (i === len)
	                return errors.length ? reject(arrays_1.flatten(errors)) : resolve(results);
	            var ret = iterator.call(context, array[i++]);
	            if (isPromise(ret)) {
	                ret.then(function (r) { results.push(r); next(null, r); }, next);
	            }
	            else if (ret instanceof Error) {
	                next(ret);
	            }
	            else {
	                next(null);
	            }
	        }
	        next(null);
	    });
	}
	exports.mapAsync = mapAsync;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }
/******/ ]);