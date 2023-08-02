import { Log } from "pepr";
import { K8sAPI } from "../kubernetes-api";
import { V1Secret } from "@kubernetes/client-node";
import { ZarfState, AuthData } from "../api-types";

export class InitSecrets {
  k8sApi: K8sAPI;

  zarfStateSecretName = "zarf-state";
  zarfStateSecretNamespace = "zarf";
  zarfStateSecretKeys = ["state"];
  zarfStateSecretData: Record<string, string>;

  privateRegistrySecretName = "private-registry";
  privateRegistrySecretNamespace = "zarf";
  privateRegistrySecretKeys = [".dockerconfigjson"];
  privateRegistrySecretData: Record<string, string>;

  zarfStateSecret: ZarfState;
  privateRegistrySecret: AuthData;

  constructor(k8sApi: K8sAPI) {
    this.k8sApi = k8sApi;
  }

  private decodeBase64(secret: V1Secret, key: string): string {
    if (!secret.data) {
      throw new Error("Data is missing in secret");
    }
    if (!secret.data[key]) {
      throw new Error(`Key ${key} is missing in secret`);
    }
    return Buffer.from(secret.data[key], "base64").toString("utf-8");
  }

  // TODO type this
  async getZarfStateSecret(): Promise<ZarfState> {
    const secretData = await this.k8sApi.getSecretValues(
      this.zarfStateSecretName,
      this.zarfStateSecretNamespace,
      this.zarfStateSecretKeys
    );

    const zarfState: ZarfState = JSON.parse(secretData.state);
    this.zarfStateSecret = zarfState;
    this.zarfStateSecretData = secretData;
    Log.info("Zarf State Secret", JSON.stringify(zarfState, undefined, 2));
    return zarfState;
  }

  async getZarfPrivateRegistrySecret(): Promise<AuthData> {
    const secretData = await this.k8sApi.getSecretValues(
      this.privateRegistrySecretName,
      this.privateRegistrySecretNamespace,
      this.privateRegistrySecretKeys
    );
    const authData: AuthData = JSON.parse(secretData[".dockerconfigjson"]);
    this.privateRegistrySecret = authData;
    this.privateRegistrySecretData = secretData;
    Log.info("Private registry secret", JSON.stringify(authData, undefined, 2));
    return authData;
  }

  async createOrUpdateSecret(
    name: string,
    namespace: string,
    secretData: Record<string, string>
  ): Promise<void> {
    await this.k8sApi.createOrUpdateSecret(name, namespace, secretData);
  }

  async patchPodImagePullSecret(
    name: string,
    namespace: string
  ): Promise<void> {
    await this.k8sApi.addImagePullSecretToPod(
      name,
      namespace,
      this.privateRegistrySecretName
    );
    return;
  }

}
