import * as grpc from 'grpc';
import * as assert from 'assert';
import * as jspb from 'google-protobuf';
import {IRpcServerCall, IRpcServerCallback} from './RpcRedefine';
import {joi, joiValidate} from '../utility/Joi';

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

export class RpcContext {

    public call: IRpcServerCall<any, any>;
    public callback: IRpcServerCallback<any>;

    constructor() {
        // do nothing
    }

    /**
     * Handle error with gRPC status.
     * @see {@link https://github.com/grpc/grpc-node/blob/master/packages/grpc-native-core/src/server.js#L46-L72}
     * @param {Error} err
     */
    public onError(err: Error) {
        assert(err instanceof Error, `non-error thrown: ${err}`);

        let call = this.call;
        let statusMetadata = new grpc.Metadata();
        let status = {
            code: grpc.status.UNKNOWN,
            details: 'Unknown Error'
        } as grpc.StatusObject;

        if (err.hasOwnProperty('message')) {
            status.details = err.message;
        }
        if (err.hasOwnProperty('code')) {
            status.code = (err as any).code;
            if (err.hasOwnProperty('details')) {
                status.details = (err as any).details;
            }
        }
        if (err.hasOwnProperty('metadata')) {
            statusMetadata = (err as any).metadata;
        }
        status.metadata = (statusMetadata as any)._getCoreRepresentation();

        let errorBatch: {[index: number]: any} = {};
        if (!(call as any).metadataSent) {
            errorBatch[GrpcOpType.SEND_INITIAL_METADATA] = (new grpc.Metadata() as any)._getCoreRepresentation();
        }
        errorBatch[GrpcOpType.SEND_STATUS_FROM_SERVER] = status;

        (call as any).call.startBatch(errorBatch, () => {
            // do nothing
        });
    }

    public validate = async (aggregatedParams: jspb.Message, schemaDefObj: joi.SchemaMap): Promise<void> => {
        try {
            await joiValidate(aggregatedParams.toObject(), schemaDefObj, {allowUnknown: true});
        } catch (e) {
            throw new Error(JSON.stringify({
                code: 1001001,
                message: 'Invalid Params' + e.details ? `: ${e.details[0].message}` : ''
            }));
        }
    };
}