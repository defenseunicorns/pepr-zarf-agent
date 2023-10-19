// package: image.defenseunicorns.com
// file: image.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class ErrorResponse extends jspb.Message {
  getErrorMessage(): string;
  setErrorMessage(value: string): ErrorResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ErrorResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: ErrorResponse,
  ): ErrorResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: ErrorResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): ErrorResponse;
  static deserializeBinaryFromReader(
    message: ErrorResponse,
    reader: jspb.BinaryReader,
  ): ErrorResponse;
}

export namespace ErrorResponse {
  export type AsObject = {
    errorMessage: string;
  };
}

export class TransformRequest extends jspb.Message {
  getTargethost(): string;
  setTargethost(value: string): TransformRequest;
  getSrcreference(): string;
  setSrcreference(value: string): TransformRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TransformRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: TransformRequest,
  ): TransformRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: TransformRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): TransformRequest;
  static deserializeBinaryFromReader(
    message: TransformRequest,
    reader: jspb.BinaryReader,
  ): TransformRequest;
}

export namespace TransformRequest {
  export type AsObject = {
    targethost: string;
    srcreference: string;
  };
}

export class TransformResponse extends jspb.Message {
  getTransformedimage(): string;
  setTransformedimage(value: string): TransformResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TransformResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: TransformResponse,
  ): TransformResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: TransformResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): TransformResponse;
  static deserializeBinaryFromReader(
    message: TransformResponse,
    reader: jspb.BinaryReader,
  ): TransformResponse;
}

export namespace TransformResponse {
  export type AsObject = {
    transformedimage: string;
  };
}
