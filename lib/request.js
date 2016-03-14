var utils_1 = require('./utils');
var strings_1 = require('./strings');
var objects_1 = require('./objects');
var promises_1 = require('./promises');
var xmlRe = /^(?:application|text)\/xml/, jsonRe = /^application\/json/, fileProto = /^file:/;
function queryStringToParams(qs) {
    var kvp, k, v, ls, params = {}, decode = decodeURIComponent;
    var kvps = qs.split('&');
    for (var i = 0, l = kvps.length; i < l; i++) {
        var param = kvps[i];
        kvp = param.split('='), k = kvp[0], v = kvp[1];
        if (v == null)
            v = true;
        k = decode(k), v = decode(v), ls = params[k];
        if (Array.isArray(ls))
            ls.push(v);
        else if (ls)
            params[k] = [ls, v];
        else
            params[k] = v;
    }
    return params;
}
exports.queryStringToParams = queryStringToParams;
function queryParam(obj) {
    return Object.keys(obj).reduce(function (a, k) { a.push(k + '=' + encodeURIComponent(obj[k])); return a; }, []).join('&');
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
        this._headers = {};
        this._params = {};
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
        if (data && data === Object(data) && this._method == 'GET') {
            var sep = (url.indexOf('?') === -1) ? '?' : '&';
            var d = sep + queryParam(data);
            url += d;
        }
        url = this._apply_params(url);
        this._xhr.open(this._method, url, true);
        for (var key in this._headers) {
            this._xhr.setRequestHeader(key, this._headers[key]);
        }
        this._xhr.send(data);
        return defer.promise;
    };
    Request.prototype.json = function (data) {
        var _this = this;
        this.header('content-type', 'application/json; charset=utf-8');
        if (!strings_1.isString(data)) {
            data = JSON.stringify(data);
        }
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
    Request.prototype.progres = function (fn) {
        this._xhr.addEventListener('progress', fn);
        return this;
    };
    Request.prototype.uploadProgress = function (fn) {
        this._xhr.upload.addEventListener('progress', fn);
        return this;
    };
    Request.prototype.header = function (field, value) {
        if (strings_1.isString(field) && strings_1.isString(value)) {
            this._headers[field] = value;
        }
        else if (objects_1.isObject(field)) {
            objects_1.extend(this._headers, field);
        }
        return this;
    };
    Request.prototype.params = function (value) {
        objects_1.extend(this._params, value);
        return this;
    };
    Request.prototype._apply_params = function (url) {
        var params = {};
        var idx = url.indexOf('?');
        if (idx > -1) {
            params = objects_1.extend(params, queryStringToParams(url.substr(idx + 1)));
            url = url.substr(0, idx);
        }
        objects_1.extend(params, this._params);
        if (!objects_1.isEmpty(params)) {
            var sep = (url.indexOf('?') === -1) ? '?' : '&';
            url += sep + queryParam(params);
        }
        return url;
    };
    return Request;
})();
exports.Request = Request;
exports.request = {};
['get', 'post', 'put', 'delete', 'patch', 'head']
    .forEach(function (m) {
    exports.request[m === 'delete' ? 'del' : m] = function (url) {
        return new Request(m.toUpperCase(), url);
    };
});
