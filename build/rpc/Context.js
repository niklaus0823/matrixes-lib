"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const grpc = require("grpc");
const assert = require("assert");
const Joi_1 = require("../utility/Joi");
var GrpcOpType;
(function (GrpcOpType) {
    GrpcOpType[GrpcOpType["SEND_INITIAL_METADATA"] = 0] = "SEND_INITIAL_METADATA";
    GrpcOpType[GrpcOpType["SEND_MESSAGE"] = 1] = "SEND_MESSAGE";
    GrpcOpType[GrpcOpType["SEND_CLOSE_FROM_CLIENT"] = 2] = "SEND_CLOSE_FROM_CLIENT";
    GrpcOpType[GrpcOpType["SEND_STATUS_FROM_SERVER"] = 3] = "SEND_STATUS_FROM_SERVER";
    GrpcOpType[GrpcOpType["RECV_INITIAL_METADATA"] = 4] = "RECV_INITIAL_METADATA";
    GrpcOpType[GrpcOpType["RECV_MESSAGE"] = 5] = "RECV_MESSAGE";
    GrpcOpType[GrpcOpType["RECV_STATUS_ON_CLIENT"] = 6] = "RECV_STATUS_ON_CLIENT";
    GrpcOpType[GrpcOpType["RECV_CLOSE_ON_SERVER"] = 7] = "RECV_CLOSE_ON_SERVER";
})(GrpcOpType = exports.GrpcOpType || (exports.GrpcOpType = {}));
class RpcContext {
    constructor() {
        this.validate = (aggregatedParams, schemaDefObj) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield Joi_1.joiValidate(aggregatedParams.toObject(), schemaDefObj, { allowUnknown: true });
            }
            catch (e) {
                throw new Error(JSON.stringify({
                    code: 1001001,
                    message: 'Invalid Params' + e.details ? `: ${e.details[0].message}` : ''
                }));
            }
        });
        // do nothing
    }
    /**
     * Handle error with gRPC status.
     * @see {@link https://github.com/grpc/grpc-node/blob/master/packages/grpc-native-core/src/server.js#L46-L72}
     * @param {Error} err
     */
    onError(err) {
        assert(err instanceof Error, `non-error thrown: ${err}`);
        let call = this.call;
        let statusMetadata = new grpc.Metadata();
        let status = {
            code: grpc.status.UNKNOWN,
            details: 'Unknown Error'
        };
        if (err.hasOwnProperty('message')) {
            status.details = err.message;
        }
        if (err.hasOwnProperty('code')) {
            status.code = err.code;
            if (err.hasOwnProperty('details')) {
                status.details = err.details;
            }
        }
        if (err.hasOwnProperty('metadata')) {
            statusMetadata = err.metadata;
        }
        status.metadata = statusMetadata._getCoreRepresentation();
        let errorBatch = {};
        if (!call.metadataSent) {
            errorBatch[GrpcOpType.SEND_INITIAL_METADATA] = new grpc.Metadata()._getCoreRepresentation();
        }
        errorBatch[GrpcOpType.SEND_STATUS_FROM_SERVER] = status;
        call.call.startBatch(errorBatch, () => {
            // do nothing
        });
    }
}
exports.RpcContext = RpcContext;
