// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var image_pb = require('./image_pb.js');

function serialize_image_defenseunicorns_com_TransformRequest(arg) {
  if (!(arg instanceof image_pb.TransformRequest)) {
    throw new Error('Expected argument of type image.defenseunicorns.com.TransformRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_image_defenseunicorns_com_TransformRequest(buffer_arg) {
  return image_pb.TransformRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_image_defenseunicorns_com_TransformResponse(arg) {
  if (!(arg instanceof image_pb.TransformResponse)) {
    throw new Error('Expected argument of type image.defenseunicorns.com.TransformResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_image_defenseunicorns_com_TransformResponse(buffer_arg) {
  return image_pb.TransformResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var ImageTransformService = exports.ImageTransformService = {
  imageTransformHost: {
    path: '/image.defenseunicorns.com.ImageTransform/ImageTransformHost',
    requestStream: false,
    responseStream: false,
    requestType: image_pb.TransformRequest,
    responseType: image_pb.TransformResponse,
    requestSerialize: serialize_image_defenseunicorns_com_TransformRequest,
    requestDeserialize: deserialize_image_defenseunicorns_com_TransformRequest,
    responseSerialize: serialize_image_defenseunicorns_com_TransformResponse,
    responseDeserialize: deserialize_image_defenseunicorns_com_TransformResponse,
  },
  imageTransformHostWithoutChecksum: {
    path: '/image.defenseunicorns.com.ImageTransform/ImageTransformHostWithoutChecksum',
    requestStream: false,
    responseStream: false,
    requestType: image_pb.TransformRequest,
    responseType: image_pb.TransformResponse,
    requestSerialize: serialize_image_defenseunicorns_com_TransformRequest,
    requestDeserialize: deserialize_image_defenseunicorns_com_TransformRequest,
    responseSerialize: serialize_image_defenseunicorns_com_TransformResponse,
    responseDeserialize: deserialize_image_defenseunicorns_com_TransformResponse,
  },
};

exports.ImageTransformClient = grpc.makeGenericClientConstructor(ImageTransformService);
