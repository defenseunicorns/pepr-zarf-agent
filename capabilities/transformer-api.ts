import { Log, a } from "pepr";
import { readFileSync } from "fs";
import "./wasm_exec.js";
import { Request } from "./api-types.js";

export class TransformerAPI {
  private go: any;
  private instance: WebAssembly.Instance;
  mutateArgoSecret(
    secret: string,
    request: string,
    targetHost: string,
    pushUsername: string,
    pullPassword: string,
    pullUsername: string,
  ): string {
    // @ts-ignore
    return zarfTransform.argoSecretTransform(
      secret,
      request,
      targetHost,
      pushUsername,
      pullPassword,
      pullUsername,
    );
  }
  mutateFluxApp(
    app: string,
    request: string,
    targetHost: string,
    pushUsername: string,
  ): string {
    // @ts-ignore
    return zarfTransform.fluxRepoTransform(
      app,
      request,
      targetHost,
      pushUsername,
    );
  }
  mutateArgoApp(
    app: string,
    request: string,
    targetHost: string,
    pushUsername: string,
  ): string {
    // @ts-ignore
    return zarfTransform.repoURLTransform(
      app,
      request,
      targetHost,
      pushUsername,
    );
  }
  mutatePod(
    pod: string,
    request: string,
    imagePullSecretName: string,
    targetHost: string,
  ): string {
    // @ts-ignore
    return zarfTransform.podTransform(
      pod,
      request,
      imagePullSecretName,
      targetHost,
    );
  }
  // this create global zarfTransform object
  private async instantiateWebAssembly(): Promise<void> {
    return WebAssembly.instantiate(
      readFileSync("capabilities/main.wasm"),
      this.go.importObject,
    ).then((wasmModule) => {
      this.instance = this.go.run(wasmModule.instance);
    });
  }

  public async run(): Promise<void> {
    this.go = new globalThis.Go();
    try {
      await this.instantiateWebAssembly();
    } catch (err) {
      Log.error("Error instantiating wasm module", err.toString());
      return;
    }
  }
  transformArgoSecret(
    secret: a.Secret,
    request: Request,
    targetHost: string,
    pushUsername: string,
    pullPassword: string,
    pullUsername: string,
  ): string {
    let transformedSecret: string;
    if (!this.instance) {
      throw new Error("WebAssembly module not loaded or initialized.");
    }
    try {
      transformedSecret = this.mutateArgoSecret(
        JSON.stringify(secret),
        JSON.stringify(request),
        targetHost,
        pushUsername,
        pullPassword,
        pullUsername,
      );
    } catch (err) {
      Log.error("Error calling repoURLTransform", err);
    }
    return transformedSecret;
  }
  transformFluxApp(
    app: a.GenericKind,
    request: Request,
    targetHost: string,
    pushUsername: string,
  ): string {
    let transformedApp: string;
    if (!this.instance) {
      throw new Error("WebAssembly module not loaded or initialized.");
    }
    try {
      transformedApp = this.mutateFluxApp(
        JSON.stringify(app),
        JSON.stringify(request),
        targetHost,
        pushUsername,
      );
    } catch (err) {
      Log.error("Error calling fluxRepoTransform", err);
    }
    return transformedApp;
  }
  transformArgoApp(
    app: a.GenericKind,
    request: Request,
    targetHost: string,
    pushUsername: string,
  ): string {
    let transformedApp: string;
    if (!this.instance) {
      throw new Error("WebAssembly module not loaded or initialized.");
    }
    try {
      transformedApp = this.mutateArgoApp(
        JSON.stringify(app),
        JSON.stringify(request),
        targetHost,
        pushUsername,
      );
    } catch (err) {
      Log.error("Error calling repoURLTransform", err);
    }
    return transformedApp;
  }
  transformPod(
    pod: a.Pod,
    request: Request,
    imagePullSecretName: string,
    targetHost: string,
  ): string {
    let transformedPod: string;
    if (!this.instance) {
      throw new Error("WebAssembly module not loaded or initialized.");
    }
    try {
      transformedPod = this.mutatePod(
        JSON.stringify(pod),
        JSON.stringify(request),
        imagePullSecretName,
        targetHost,
      );
    } catch (err) {
      Log.error("Error calling podTransform", err);
    }
    return transformedPod;
  }
}
