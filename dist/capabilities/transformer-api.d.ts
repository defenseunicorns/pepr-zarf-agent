import { a } from "pepr";
import "./wasm_exec.js";
import { Request } from "./api-types.js";
export declare class TransformerAPI {
    private go;
    private instance;
    transform(pod: string, request: string, imagePullSecretName: string, targetHost: string): string;
    private instantiateWebAssembly;
    run(): Promise<void>;
    transformPod(pod: a.Pod, request: Request, imagePullSecretName: string, targetHost: string): string;
}
//# sourceMappingURL=transformer-api.d.ts.map