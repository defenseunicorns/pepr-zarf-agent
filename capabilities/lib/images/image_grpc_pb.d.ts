// package: image.defenseunicorns.com
// file: image.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as image_pb from "./image_pb";

interface IImageTransformService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    imageTransformHost: IImageTransformService_IImageTransformHost;
    imageTransformHostWithoutChecksum: IImageTransformService_IImageTransformHostWithoutChecksum;
}

interface IImageTransformService_IImageTransformHost extends grpc.MethodDefinition<image_pb.TransformRequest, image_pb.TransformResponse> {
    path: "/image.defenseunicorns.com.ImageTransform/ImageTransformHost";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<image_pb.TransformRequest>;
    requestDeserialize: grpc.deserialize<image_pb.TransformRequest>;
    responseSerialize: grpc.serialize<image_pb.TransformResponse>;
    responseDeserialize: grpc.deserialize<image_pb.TransformResponse>;
}
interface IImageTransformService_IImageTransformHostWithoutChecksum extends grpc.MethodDefinition<image_pb.TransformRequest, image_pb.TransformResponse> {
    path: "/image.defenseunicorns.com.ImageTransform/ImageTransformHostWithoutChecksum";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<image_pb.TransformRequest>;
    requestDeserialize: grpc.deserialize<image_pb.TransformRequest>;
    responseSerialize: grpc.serialize<image_pb.TransformResponse>;
    responseDeserialize: grpc.deserialize<image_pb.TransformResponse>;
}

export const ImageTransformService: IImageTransformService;

export interface IImageTransformServer extends grpc.UntypedServiceImplementation {
    imageTransformHost: grpc.handleUnaryCall<image_pb.TransformRequest, image_pb.TransformResponse>;
    imageTransformHostWithoutChecksum: grpc.handleUnaryCall<image_pb.TransformRequest, image_pb.TransformResponse>;
}

export interface IImageTransformClient {
    imageTransformHost(request: image_pb.TransformRequest, callback: (error: grpc.ServiceError | null, response: image_pb.TransformResponse) => void): grpc.ClientUnaryCall;
    imageTransformHost(request: image_pb.TransformRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: image_pb.TransformResponse) => void): grpc.ClientUnaryCall;
    imageTransformHost(request: image_pb.TransformRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: image_pb.TransformResponse) => void): grpc.ClientUnaryCall;
    imageTransformHostWithoutChecksum(request: image_pb.TransformRequest, callback: (error: grpc.ServiceError | null, response: image_pb.TransformResponse) => void): grpc.ClientUnaryCall;
    imageTransformHostWithoutChecksum(request: image_pb.TransformRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: image_pb.TransformResponse) => void): grpc.ClientUnaryCall;
    imageTransformHostWithoutChecksum(request: image_pb.TransformRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: image_pb.TransformResponse) => void): grpc.ClientUnaryCall;
}

export class ImageTransformClient extends grpc.Client implements IImageTransformClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public imageTransformHost(request: image_pb.TransformRequest, callback: (error: grpc.ServiceError | null, response: image_pb.TransformResponse) => void): grpc.ClientUnaryCall;
    public imageTransformHost(request: image_pb.TransformRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: image_pb.TransformResponse) => void): grpc.ClientUnaryCall;
    public imageTransformHost(request: image_pb.TransformRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: image_pb.TransformResponse) => void): grpc.ClientUnaryCall;
    public imageTransformHostWithoutChecksum(request: image_pb.TransformRequest, callback: (error: grpc.ServiceError | null, response: image_pb.TransformResponse) => void): grpc.ClientUnaryCall;
    public imageTransformHostWithoutChecksum(request: image_pb.TransformRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: image_pb.TransformResponse) => void): grpc.ClientUnaryCall;
    public imageTransformHostWithoutChecksum(request: image_pb.TransformRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: image_pb.TransformResponse) => void): grpc.ClientUnaryCall;
}
