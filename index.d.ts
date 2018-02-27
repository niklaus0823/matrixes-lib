import * as grpc from 'grpc';
import * as joi from 'joi';
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
    public call: IRpcServerCall<RequestType, ResponseType>;
    public callback: IRpcServerCallback<ResponseType>;

    constructor();

    /**
     * Handle error with gRPC status.
     * @see {@link https://github.com/grpc/grpc/blob/v1.3.7/src/node/src/server.js#L69-L101}
     * @param {Error} err
     */
    onError(err: Error): void;
}

// gRPC Application
export type RpcMiddleware = (ctx: RpcContext, next: MiddlewareNext) => Promise<any>;
export type MiddlewareNext = () => Promise<any>;
export type WrappedHandler = (call: IRpcServerCall<RequestType, ResponseType>, callback?: IRpcServerCallback<ResponseType>) => Promise<any>;

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
export {joi, joiValidate};

// Gateway
export interface GatewayContext extends KoaContext {
    params: any;
    request: GatewayRequest;
}

export interface GatewayRequest extends KoaRequest {
    body: any;
}

export interface GatewayJoiSchema {
    type: string;
    required: boolean;
    schema?: GatewayJoiSchemaMap;
}

export interface GatewayJoiSchemaMap {
    [name: string]: GatewayJoiSchema;
}

export interface GatewayApiParams {
    [key: string]: any;
}

export declare abstract class GatewayApiBase {
    method: string;
    uri: string;
    type: string;
    schemaDefObj: GatewayJoiSchemaMap;

    abstract handle(ctx: GatewayContext, next: MiddlewareNext, params: GatewayApiParams): Promise<any>;

    register(): Array<string | KoaMiddleware>;
}
