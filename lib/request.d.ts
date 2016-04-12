import { IPromise } from './promises';
export declare enum HttpMethod {
    GET = 0,
    PUT = 1,
    POST = 2,
    DELETE = 3,
    HEAD = 4,
}
export declare class HttpError extends Error {
    status: number;
    message: string;
    body: any;
    url: string;
    constructor(status: number, message: string, body?: any);
}
export declare class ResponseError extends Error {
    constructor(message: string);
}
export declare function queryStringToParams(qs: string): Object;
export declare function queryParam(obj: any): string;
export interface Response<T> {
    status: number;
    statusText: string;
    body: any;
    headers: {
        [key: string]: string;
    };
    isValid: boolean;
    contentLength: number;
    contentType: string;
}
export declare class Request {
    private _method;
    private _url;
    private _xhr;
    private _params;
    private _headers;
    private _data;
    constructor(_method: HttpMethod, _url: string);
    uploadProgress(fn: (e: ProgressEvent) => void): this;
    downloadProgress(fn: (e: ProgressEvent) => void): this;
    header(field: string | {
        [key: string]: string;
    }, value?: string): this;
    params(key: string | {
        [key: string]: any;
    }, value?: any): this;
    withCredentials(ret: any): Request;
    json<T>(data?: any): IPromise<Response<T>>;
    end<T>(data?: any): IPromise<Response<T>>;
    private _apply_params(url);
}
export interface IRequest {
    get(url: string): Request;
    post(url: string): Request;
    put(url: string): Request;
    del(url: string): Request;
    patch(url: string): Request;
    head(url: string): Request;
}
export declare var request: IRequest;
