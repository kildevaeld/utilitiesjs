import { IPromise } from './promises';
export declare function queryStringToParams(qs: string): Object;
export interface Deferrable<U> {
    promise: IPromise<U>;
    done: (error: Error, result: U) => void;
    reject: (error: Error) => void;
    resolve: (result: U) => void;
}
export declare function queryParam(obj: any): string;
export declare class Request {
    private _method;
    private _url;
    private _xhr;
    private _data;
    private _headers;
    private _params;
    constructor(_method: string, _url: string);
    send(data: any): Request;
    withCredentials(ret: any): Request;
    end(data?: any): IPromise<string>;
    json(data?: any): IPromise<Object>;
    progress(fn: (e: ProgressEvent) => void): Request;
    uploadProgress(fn: (e: ProgressEvent) => void): Request;
    header(field: string | {
        [key: string]: string;
    }, value?: string): Request;
    params(value: any): Request;
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
