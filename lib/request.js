"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var strings_1 = require('./strings');
var objects_1 = require('./objects');
var promises_1 = require('./promises');
var utils_1 = require('./utils');
(function (HttpMethod) {
    HttpMethod[HttpMethod["GET"] = 0] = "GET";
    HttpMethod[HttpMethod["PUT"] = 1] = "PUT";
    HttpMethod[HttpMethod["POST"] = 2] = "POST";
    HttpMethod[HttpMethod["DELETE"] = 3] = "DELETE";
    HttpMethod[HttpMethod["HEAD"] = 4] = "HEAD";
})(exports.HttpMethod || (exports.HttpMethod = {}));
var HttpMethod = exports.HttpMethod;
var HttpError = (function (_super) {
    __extends(HttpError, _super);
    function HttpError(status, message, body) {
        _super.call(this, message);
        this.status = status;
        this.message = message;
        this.body = body;
    }
    return HttpError;
}(Error));
exports.HttpError = HttpError;
var ResponseError = (function (_super) {
    __extends(ResponseError, _super);
    function ResponseError(message) {
        _super.call(this, message);
    }
    return ResponseError;
}(Error));
exports.ResponseError = ResponseError;
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
var jsonRe = /^application\/json/, fileProto = /^file:/;
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
        this._params = {};
        this._headers = { 'X-Requested-With': 'XMLHttpRequest' };
        this._xhr = utils_1.ajax();
    }
    Request.prototype.uploadProgress = function (fn) {
        this._xhr.upload.addEventListener('progress', fn);
        return this;
    };
    Request.prototype.downloadProgress = function (fn) {
        this._xhr.addEventListener('progress', fn);
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
    Request.prototype.params = function (key, value) {
        if (arguments.length === 1 && objects_1.isObject(key)) {
            objects_1.extend(this._params, key);
        }
        else if (arguments.length === 2) {
            this._params[key] = value;
        }
        return this;
    };
    Request.prototype.withCredentials = function (ret) {
        this._xhr.withCredentials = ret;
        return this;
    };
    Request.prototype.json = function (data) {
        var _this = this;
        this.header('content-type', 'application/json; charset=utf-8');
        if (!strings_1.isString(data)) {
            data = JSON.stringify(data);
        }
        return this.end(data)
            .then(function (resp) {
            var accepts = _this._xhr.getResponseHeader('content-type');
            if (jsonRe.test(accepts) && resp.body != "") {
                var json = JSON.parse(resp.body);
                var jResp = resp;
                jResp.body = json;
                return jResp;
            }
            else {
                throw new ResponseError("type error");
            }
        });
    };
    Request.prototype.end = function (data) {
        var _this = this;
        data = data || this._data;
        var defer = promises_1.deferred();
        this._xhr.addEventListener('readystatechange', function () {
            if (_this._xhr.readyState !== XMLHttpRequest.DONE)
                return;
            var resp = {
                status: _this._xhr.status,
                statusText: _this._xhr.statusText,
                body: null,
                headers: {},
                isValid: false,
                contentLength: 0,
                contentType: null
            };
            var headers = _this._xhr.getAllResponseHeaders().split('\r\n');
            if (headers.length) {
                for (var i = 0, ii = headers.length; i < ii; i++) {
                    if (headers[i] === '')
                        continue;
                    var split = headers[i].split(':');
                    resp.headers[split[0].trim()] = split[1].trim();
                }
            }
            resp.contentType = resp.headers['Content-Type'];
            resp.contentLength = parseInt(resp.headers['Content-Length']);
            if (isNaN(resp.contentLength))
                resp.contentLength = 0;
            resp.body = _this._xhr.response;
            resp.isValid = isValid(_this._xhr, _this._url);
            defer.resolve(resp);
        });
        var method = HttpMethod[this._method];
        var url = this._url;
        if (data && data === Object(data) && this._method == HttpMethod.GET) {
            var sep = (url.indexOf('?') === -1) ? '?' : '&';
            var d = sep + queryParam(data);
            url += d;
        }
        url = this._apply_params(url);
        this._xhr.open(method, url, true);
        for (var key in this._headers) {
            this._xhr.setRequestHeader(key, this._headers[key]);
        }
        this._xhr.send(data);
        return defer.promise;
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
}());
exports.Request = Request;
exports.request = {};
['get', 'post', 'put', 'delete', 'patch', 'head']
    .forEach(function (m) {
    exports.request[m === 'delete' ? 'del' : m] = function (url) {
        var mm = HttpMethod[m.toUpperCase()];
        return new Request(mm, url);
    };
});
