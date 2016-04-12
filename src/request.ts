import {isString} from './strings';
import {isEmpty, isObject, extend, has} from './objects'
import {deferred, IPromise, Thenable} from './promises';
import {ajax} from './utils';

export enum HttpMethod {
    GET, PUT, POST, DELETE, HEAD
}

export interface Result<T> extends Thenable<T> {
    json(): Thenable<T>;
}

export function isResponse(a:any): a is Response<any> {
    return isObject(status) && has(a, 'status') && has(a, 'statusText') && has(a, 'body')
}

export class HttpError extends Error {
    status: number;
    message: string;
    body: any;
    url: string;
    constructor(status: number|Response<any>, message?: string, body?: any) {
        super(message);
        
        if (arguments.length === 1) {
            if (isResponse(status)) {
                this.status = status.status;
                this.message = status.statusText;
                this.body = status.body;
            } else {
                this.status = status
            }
        } else {
            this.status = <number>status;
            this.message = message;
            this.body = body;    
        }
        
        
    }
}

export class ResponseError extends Error {
    constructor(message: string) {
        super(message);
    }
}


export function queryStringToParams(qs: string): Object {
    var kvp, k, v, ls, params = {}, decode = decodeURIComponent;
    var kvps = qs.split('&');
    for (var i = 0, l = kvps.length; i < l; i++) {
        var param = kvps[i];
        kvp = param.split('='), k = kvp[0], v = kvp[1];
        if (v == null) v = true;
        k = decode(k), v = decode(v), ls = params[k];
        if (Array.isArray(ls)) ls.push(v);
        else if (ls) params[k] = [ls, v];
        else params[k] = v;
    }
    return params;
}

export function queryParam(obj): string {
    return Object.keys(obj).reduce(function(a, k) { a.push(k + '=' + encodeURIComponent(obj[k])); return a }, []).join('&')
}

export interface Response<T> {
    status: number;
    statusText: string;
    body: T;
    headers: { [key: string]: string };
    isValid: boolean;
    contentLength: number;
    contentType: string;
}

const jsonRe = /^application\/json/,
    fileProto = /^file:/;

var isValid = function(xhr, url) {
    return (xhr.status >= 200 && xhr.status < 300) ||
        (xhr.status === 304) ||
        (xhr.status === 0 && fileProto.test(url)) ||
        (xhr.status === 0 && window.location.protocol === 'file:')
};

export class Request {
    private _xhr: XMLHttpRequest;
    private _params: any = {};
    private _headers: { [key: string]: string } = { 'X-Requested-With': 'XMLHttpRequest' };
    private _data: any;

    constructor(private _method: HttpMethod, private _url: string) {
        this._xhr = ajax();
    }

    uploadProgress(fn: (e: ProgressEvent) => void) {
        this._xhr.upload.addEventListener('progress', fn);
        return this;
    }

    downloadProgress(fn: (e: ProgressEvent) => void) {
        this._xhr.addEventListener('progress', fn);
        return this;
    }

    header(field: string | { [key: string]: string }, value?: string) {
        if (isString(field) && isString(value)) {
            this._headers[field] = value;
        } else if (isObject(field)) {
            extend(this._headers, field);
        }

        return this;
    }

    params(key: string | { [key: string]: any }, value?: any) {
        if (arguments.length === 1 && isObject(key)) {
            extend(this._params, key);
        } else if (arguments.length === 2) {
            this._params[<string>key] = value;
        }
        return this;
    }

    withCredentials(ret): Request {
        this._xhr.withCredentials = ret;
        return this;
    }

    json<T>(data?: any, throwOnInvalid:boolean = false): IPromise<Response<T>> {
        this.header('content-type', 'application/json; charset=utf-8');
        if (!isString(data)) {
            data = JSON.stringify(data);
        }
        return this.end<string>(data, throwOnInvalid)
            .then<Response<T>>((resp) => {
                let accepts = this._xhr.getResponseHeader('content-type')

                if (jsonRe.test(accepts) && resp.body != "") {
                    let json = JSON.parse(resp.body)

                    let jResp: Response<T> = <any>resp
                    jResp.body = json;

                    return jResp;
                } else {
                    throw new ResponseError("type error")
                }
            });
    }

    end<T>(data?: any, throwOnInvalid:boolean = false): IPromise<Response<T>> {

        data = data || this._data;

        let defer = deferred();

        this._xhr.addEventListener('readystatechange', () => {
            if (this._xhr.readyState !== XMLHttpRequest.DONE) return;

            let resp: Response<T> = {
                status: this._xhr.status,
                statusText: this._xhr.statusText,
                body: null,
                headers: {},
                isValid: false,
                contentLength: 0,
                contentType: null
            };

            let headers = this._xhr.getAllResponseHeaders().split('\r\n');

            if (headers.length) {
                for (let i = 0, ii = headers.length; i < ii; i++) {
                    if (headers[i] === '') continue;

                    let split = headers[i].split(':');
                    resp.headers[split[0].trim()] = split[1].trim();
                }
            }

            resp.contentType = resp.headers['Content-Type'];
            resp.contentLength = parseInt(resp.headers['Content-Length']);

            if (isNaN(resp.contentLength)) resp.contentLength = 0;

            resp.body = this._xhr.response;
            resp.isValid = isValid(this._xhr, this._url);

            if (!resp.isValid && throwOnInvalid) {
                return defer.reject(new HttpError(resp));
            }

            defer.resolve(resp);


        });


        let method = HttpMethod[this._method];

        //data = this._data;
        let url = this._url;
        if (data && data === Object(data) && this._method == HttpMethod.GET /* && check for content-type */) {
            var sep = (url.indexOf('?') === -1) ? '?' : '&';
            let d = sep + queryParam(data)
            url += d
        }

        url = this._apply_params(url);

        this._xhr.open(method, url, true);

        for (let key in this._headers) {
            this._xhr.setRequestHeader(key, this._headers[key]);
        }

        this._xhr.send(data);

        return defer.promise;

    }
    
    /*public result<T>(data: any) : Result<T> {
       
        return <Result<T>{
            then (resolve, reject) {
                
            },
            catch (reject) {
                
            },
            json () {
                
            }
        }
        
    }*/

    private _apply_params(url: string): string {
        let params = {};
        let idx = url.indexOf('?');
        if (idx > -1) {
            params = extend(params, queryStringToParams(url.substr(idx + 1)));
            url = url.substr(0, idx);
        }

        extend(params, this._params);

        if (!isEmpty(params)) {
            var sep = (url.indexOf('?') === -1) ? '?' : '&';
            url += sep + queryParam(params);
        }

        return url;
    }
}

export interface IRequest {
    get(url: string): Request;
    post(url: string): Request;
    put(url: string): Request;
    del(url: string): Request;
    patch(url: string): Request;
    head(url: string): Request;
}



export var request: IRequest = <any>{};

['get', 'post', 'put', 'delete', 'patch', 'head']
    .forEach((m) => {
        request[m === 'delete' ? 'del' : m] = function(url: string): Request {

            let mm = HttpMethod[m.toUpperCase()];

            return new Request(mm, url);
        };
    });
