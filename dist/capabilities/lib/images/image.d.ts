import * as _m0 from "protobufjs/minimal";
export declare const protobufPackage = "image.defenseunicorns.com";
export interface ErrorResponse {
    errorMessage: string;
}
export interface TransformRequest {
    targetHost: string;
    srcReference: string;
}
export interface TransformResponse {
    transformedImage: string;
}
export declare const ErrorResponse: {
    encode(message: ErrorResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ErrorResponse;
    fromJSON(object: any): ErrorResponse;
    toJSON(message: ErrorResponse): unknown;
    create<I extends {
        errorMessage?: string;
    } & {
        errorMessage?: string;
    } & { [K in Exclude<keyof I, "errorMessage">]: never; }>(base?: I): ErrorResponse;
    fromPartial<I_1 extends {
        errorMessage?: string;
    } & {
        errorMessage?: string;
    } & { [K_1 in Exclude<keyof I_1, "errorMessage">]: never; }>(object: I_1): ErrorResponse;
};
export declare const TransformRequest: {
    encode(message: TransformRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TransformRequest;
    fromJSON(object: any): TransformRequest;
    toJSON(message: TransformRequest): unknown;
    create<I extends {
        targetHost?: string;
        srcReference?: string;
    } & {
        targetHost?: string;
        srcReference?: string;
    } & { [K in Exclude<keyof I, keyof TransformRequest>]: never; }>(base?: I): TransformRequest;
    fromPartial<I_1 extends {
        targetHost?: string;
        srcReference?: string;
    } & {
        targetHost?: string;
        srcReference?: string;
    } & { [K_1 in Exclude<keyof I_1, keyof TransformRequest>]: never; }>(object: I_1): TransformRequest;
};
export declare const TransformResponse: {
    encode(message: TransformResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TransformResponse;
    fromJSON(object: any): TransformResponse;
    toJSON(message: TransformResponse): unknown;
    create<I extends {
        transformedImage?: string;
    } & {
        transformedImage?: string;
    } & { [K in Exclude<keyof I, "transformedImage">]: never; }>(base?: I): TransformResponse;
    fromPartial<I_1 extends {
        transformedImage?: string;
    } & {
        transformedImage?: string;
    } & { [K_1 in Exclude<keyof I_1, "transformedImage">]: never; }>(object: I_1): TransformResponse;
};
export interface ImageTransform {
    ImageTransformHost(request: TransformRequest): Promise<TransformResponse>;
    ImageTransformHostWithoutChecksum(request: TransformRequest): Promise<TransformResponse>;
}
export declare const ImageTransformServiceName = "image.defenseunicorns.com.ImageTransform";
export declare class ImageTransformClientImpl implements ImageTransform {
    private readonly rpc;
    private readonly service;
    constructor(rpc: Rpc, opts?: {
        service?: string;
    });
    ImageTransformHost(request: TransformRequest): Promise<TransformResponse>;
    ImageTransformHostWithoutChecksum(request: TransformRequest): Promise<TransformResponse>;
}
interface Rpc {
    request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P : P & {
    [K in keyof P]: Exact<P[K], I[K]>;
} & {
    [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
};
export {};
//# sourceMappingURL=image.d.ts.map