import * as grpc from 'grpc';

export type IRpcServerUnaryCall<RequestType> = grpc.ServerUnaryCall<RequestType>
export type IRpcServerReadableStream<RequestType> = grpc.ServerReadableStream<RequestType>
export type IRpcServerWriteableStream<RequestType> = grpc.ServerWriteableStream<RequestType>
export type IRpcServerDuplexStream<RequestType, ResponseType> = grpc.ServerDuplexStream<RequestType, ResponseType>

// redefine ServerCall
export type IRpcServerCall<RequestType, ResponseType> = IRpcServerUnaryCall<RequestType>
    | IRpcServerReadableStream<RequestType>
    | IRpcServerWriteableStream<RequestType>
    | IRpcServerDuplexStream<RequestType, ResponseType>;

// redefine ServerCallback
export type IRpcServerCallback<ResponseType> = grpc.sendUnaryData<ResponseType>