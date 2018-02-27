import * as grpc from 'grpc';

// redefine ServerCall
export type IRpcServerCall<RequestType, ResponseType> = grpc.ServerUnaryCall<RequestType>
    | grpc.ServerReadableStream<RequestType>
    | grpc.ServerWriteableStream<RequestType>
    | grpc.ServerDuplexStream<RequestType, ResponseType>;

// redefine ServerCallback
export type IRpcServerCallback<ResponseType> = grpc.sendUnaryData<ResponseType>