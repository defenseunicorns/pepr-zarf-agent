import "./wasm_exec.js";
export declare class TransformerAPI {
    private go;
    private instance;
    transform(pod: string, request: string, imagePullSecretName: string, targetHost: string): string;
    private instantiateWebAssembly;
    run(): Promise<void>;
    transformPod(pod: any, request: any, imagePullSecretName: string, targetHost: string): string;
}
//# sourceMappingURL=transformer-api.d.ts.map