import * as grpc from 'grpc';
import * as assert from 'assert';
import * as koaCompose from 'koa-compose';
import * as koaConvert from 'koa-convert';
import * as isGeneratorFunction from 'is-generator-function';
import * as EventEmitter from 'events';
import {IRpcServerCall, IRpcServerCallback} from './RpcRedefine';
import {RpcContext} from './Context';

const debug = require('debug')('matrix:application');

export type RpcMiddleware = (ctx: RpcContext, next: MiddlewareNext) => Promise<any>;
export type MiddlewareNext = () => Promise<any>;
export type WrappedHandler = (call: IRpcServerCall<any, any>, callback?: IRpcServerCallback<any>) => Promise<any>;

export class RpcApplication extends EventEmitter {

    private _middleware: Array<RpcMiddleware>;
    private _server: grpc.Server;

    constructor() {
        super();
        this._middleware = [];
        this._server = new grpc.Server();
    }

    /**
     * Get the gRPC Server.
     *
     * @returns {grpc.Server}
     */
    public get server() {
        return this._server;
    }

    /**
     * Bind the server with a port and a given credential.
     *
     * @param {string} address format: "address:port"
     * @param {grpc.ServerCredentials} creds optional
     * @returns {RpcApplication}
     */
    public bind(address: string, creds?: grpc.ServerCredentials): RpcApplication {
        if (!creds) {
            creds = grpc.ServerCredentials.createInsecure();
        }
        debug('bind address: %s', address);
        this._server.bind(address, creds);
        return this;
    }

    /**
     * Start the RpcApplication server.
     */
    public start(): void {
        this._server.start();
    }

    /**
     * Use the given middleware.
     * @param {RpcMiddleware} middleware
     * @returns {RpcApplication}
     */
    use(middleware: RpcMiddleware): RpcApplication {
        if (typeof middleware !== 'function') throw new TypeError('middleware must be a function!');
        if (isGeneratorFunction(middleware)) {
            middleware = koaConvert(middleware);
        }
        debug('use %s', (middleware as any)._name || middleware.name || '-');
        this._middleware.push(middleware);
        return this;
    }

    /**
     * Create context instance.
     * @param {IRpcServerCall} call
     * @param {IRpcServerCallback} callback optional
     * @returns {RpcContext}
     * @private
     */
    private _createContext(call: IRpcServerCall<any, any>, callback?: IRpcServerCallback<any>): RpcContext {
        let ctx = new RpcContext();

        ctx.call = call;
        ctx.callback = callback ? callback : () => {
            // do nothing
        };

        return ctx;
    }

    /**
     * Default RpcApplication error handler.
     * @param {Error} err
     * @private
     */
    private _onError(err: Error): void {
        assert(err instanceof Error, `non-error thrown: ${err}`);

        const msg = err.stack || err.toString();
        console.error();
        console.error(msg.replace(/^/gm, '  '));
        console.error();
    }

    /**
     * Wrap gRPC handler with other middleware.
     * @param {RpcMiddleware} reqHandler
     * @returns {WrappedHandler}
     */
    public wrapGrpcHandler(reqHandler: RpcMiddleware): WrappedHandler {
        let middleware = [...this._middleware, reqHandler];
        let fn = koaCompose(middleware);

        if (!this.listeners('error').length) {
            this.on('error', this._onError);
        }

        return async (call: IRpcServerCall<any, any>, callback?: IRpcServerCallback<any>) => {
            const ctx = this._createContext(call, callback);
            const onError = (err) => ctx.onError(err);
            return fn(ctx).catch(onError);
        };
    }
}