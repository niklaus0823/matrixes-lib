import * as grpc from 'grpc';
import * as joi from 'joi';
import * as jspb from 'google-protobuf';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as KoaBodyParser from 'koa-bodyparser';
import * as EventEmitter from 'events';
import {Context as KoaContext, Middleware as KoaMiddleware, Request as KoaRequest} from 'koa';

// gRPC redefine
export type IRpcServerUnaryCall<RequestType> = grpc.ServerUnaryCall<RequestType>
export type IRpcServerReadableStream<RequestType> = grpc.ServerReadableStream<RequestType>
export type IRpcServerWriteableStream<RequestType> = grpc.ServerWriteableStream<RequestType>
export type IRpcServerDuplexStream<RequestType, ResponseType> = grpc.ServerDuplexStream<RequestType, ResponseType>
export type IRpcServerCall<RequestType, ResponseType> = IRpcServerUnaryCall<RequestType>
    | IRpcServerReadableStream<RequestType>
    | IRpcServerWriteableStream<RequestType>
    | IRpcServerDuplexStream<RequestType, ResponseType>;
export type IRpcServerCallback<ResponseType> = grpc.sendUnaryData<ResponseType>

// gRPC Context
export enum GrpcOpType {
    SEND_INITIAL_METADATA = 0,
    SEND_MESSAGE = 1,
    SEND_CLOSE_FROM_CLIENT = 2,
    SEND_STATUS_FROM_SERVER = 3,
    RECV_INITIAL_METADATA = 4,
    RECV_MESSAGE = 5,
    RECV_STATUS_ON_CLIENT = 6,
    RECV_CLOSE_ON_SERVER = 7,
}

export declare class RpcContext {
    public call: IRpcServerCall<any, any>;
    public callback: IRpcServerCallback<any>;

    constructor();

    /**
     * Handle error with gRPC status.
     * @see {@link https://github.com/grpc/grpc/blob/v1.3.7/src/node/src/server.js#L69-L101}
     * @param {Error} err
     */
    onError(err: Error): void;

    validate(aggregatedParams: jspb.Message, schemaDefObj: joi.SchemaMap): Promise<void>;
}

// gRPC Application
export type RpcMiddleware = (ctx: RpcContext, next: MiddlewareNext) => Promise<any>;
export type MiddlewareNext = () => Promise<any>;
export type WrappedHandler = (call: IRpcServerCall<any, any>, callback?: IRpcServerCallback<any>) => Promise<any>;

export declare class RpcApplication extends EventEmitter {
    constructor();

    readonly server: grpc.Server;

    bind(address: string, creds?: grpc.ServerCredentials): RpcApplication;

    start(): void;

    use(middleware: RpcMiddleware): this;

    wrapGrpcHandler(reqHandler: RpcMiddleware): WrappedHandler;
}

// Gateway Utility
declare let joiValidate: <T>(value: Object, schema: Object, options: joi.ValidationOptions) => Promise<T>;

declare namespace joiType {
    export const vDouble: any;

    export const vFloat: any;

    export const vNumber: any;

    export const vInt32: any;

    export const vSint32: any;

    export const vSfixed32: any;

    export const vInt64: any;

    export const vSint64: any;

    export const vSfixed64: any;

    export const vUintNumber: any;

    export const vUint32: any;

    export const vFixed32: any;

    export const vUint64: any;

    export const vFixed64: any;

    export const vBool: any;

    export const vString: any;
}

export {joi, joiValidate, joiType};

// Gateway
export interface GatewayContext extends KoaContext {
    params: any;
    request: GatewayRequest;
}

export interface GatewayRequest extends KoaRequest {
    body: any;
}

export interface GatewayApiParams {
    [key: string]: any;
}

export declare abstract class GatewayApiBase {
    method: string;
    uri: string;
    type: string;
    schemaDefObj: joi.SchemaMap;

    abstract handle(ctx: GatewayContext, next: MiddlewareNext, params: GatewayApiParams): Promise<any>;

    abstract handleMock(ctx: GatewayContext, next: MiddlewareNext, params: GatewayApiParams): Promise<any>;

    register(): Array<string | KoaMiddleware>;
}

export {Koa, KoaRouter, KoaBodyParser};