import { a } from "pepr";
import "./wasm_exec.js";
import { Request } from "./api-types.js";
export declare class TransformerAPI {
    private go;
    private instance;
    mutateArgoSecret(secret: string, request: string, targetHost: string, pushUsername: string): string;
    mutateArgoApp(app: string, request: string, targetHost: string, pushUsername: string): string;
    mutatePod(pod: string, request: string, imagePullSecretName: string, targetHost: string): string;
    private instantiateWebAssembly;
    run(): Promise<void>;
    transformArgoSecret(secret: a.Secret, request: Request, targetHost: string, pushUsername: string): string;
    transformArgoApp(app: a.GenericKind, request: Request, targetHost: string, pushUsername: string): string;
    transformPod(pod: a.Pod, request: Request, imagePullSecretName: string, targetHost: string): string;
}
//# sourceMappingURL=transformer-api.d.ts.map