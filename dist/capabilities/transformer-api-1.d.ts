import { PeprRequest, a } from "pepr";
import { ImageTransformClient } from "./lib/images/image_grpc_pb";
import "wasm_exec";
export declare class TransformerAPI {
    client: ImageTransformClient;
    constructor();
    transformAllContainers(pod: PeprRequest<a.Pod>, address: string): Promise<void>;
    imageTransformHost(targetHost: string, srcReference: string): Promise<string>;
    imageTransformHostWithoutChecksum(targetHost: string, srcReference: string): Promise<string>;
}
//# sourceMappingURL=transformer-api-1.d.ts.map