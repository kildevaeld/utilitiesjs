import {ajax} from './utils'
import {IPromise, Promise, deferred, Deferred} from './promises'

const xmlRe = /^(?:application|text)\/xml/,
      jsonRe = /^application\/json/,
      fileProto = /^file:/;

export interface Deferrable<U> {
  promise: IPromise<U>
  done: (error:Error,result:U) => void
  reject: (error:Error) => void
  resolve: (result:U) => void
}

export function queryParam ( obj ): string {
  return '?'+Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a},[]).join('&')
}

var isValid = function(xhr, url) {
    return (xhr.status >= 200 && xhr.status < 300) ||
      (xhr.status === 304) ||
      (xhr.status === 0 && fileProto.test(url)) ||
      (xhr.status === 0 && window.location.protocol === 'file:')
  };


export class Response {
  code: number;
}

export class Request {

    private _xhr: XMLHttpRequest
    private _data: any
    private _headers: any
    private _params: string
    constructor (private _method: string, private _url: string,  params?: any) {
      this._xhr = ajax();
      this._headers = {};
      this.params(params);
    }

    params(params:any): Request {
      if (typeof params !== 'string') {
        if (params === Object(params)) {
          this._params = queryParam(params);
        }
      } else if(params[0] !== '?') { params = '?' + params }
      this._params = params;
      return this;
    }

    send (data:any): Request {
      this._data = data;
      return this;
    }

    withCredentials (ret): Request {
      this._xhr.withCredentials = ret;
      return this;
    }

    end (data?:any): IPromise<string> {
      this._data = data||this._data;

      let defer = <Deferred<string>>deferred<string>();

      this._xhr.addEventListener('readystatechange', () => {
        if (this._xhr.readyState !== XMLHttpRequest.DONE) return;

        /*if (!isValid(this._xhr, this._url)) {
          return defer.reject(new Error('server responded with: ' + this._xhr.status));
        }*/



        defer.resolve(this._xhr.responseText);

      });

      data = this._data;
      let url = this._url;

      let contentType = this._headers['Content-Type']||this._headers['content-type'];

      if (data && data === Object(data) /* && check for content-type */) {

        let d = queryParam(data)
        url += d
      }

      this._xhr.open(this._method, url, true);



      this._xhr.send(data);

      return defer.promise;

    }

    json (data?: any): IPromise<Object> {

      return this.end(data)
      .then<Object>((str) => {
        let accepts = this._xhr.getResponseHeader('content-type')

        if (jsonRe.test(accepts) && str !== '') {
          let json = JSON.parse(str)
          return json
        } else {
          throw new Error('json')
        }


      })
    }

    progress (fn) {
      this._xhr.addEventListener('progress', fn);
      return this;
    }

    header (field: string, value: string): Request {
      this._headers[field] = value;
      //this._xhr.setRequestHeader(field,value)
      return this
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
            return new Request(m.toUpperCase(), url);
        };
    });
