import { K8sAPI } from "../kubernetes-api";
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

  async getZarfStateSecret(): Promise<ZarfState> {
    const secretData = await this.k8sApi.getSecretValues(
      this.zarfStateSecretName,
      this.zarfStateSecretNamespace,
      this.zarfStateSecretKeys,
    );

    const zarfState: ZarfState = JSON.parse(secretData.state);
    this.zarfStateSecret = zarfState;
    this.zarfStateSecretData = secretData;
    return zarfState;
  }

  async getZarfPrivateRegistrySecret(): Promise<AuthData> {
    const secretData = await this.k8sApi.getSecretValues(
      this.privateRegistrySecretName,
      this.privateRegistrySecretNamespace,
      this.privateRegistrySecretKeys,
    );
    const authData: AuthData = JSON.parse(secretData[".dockerconfigjson"]);
    this.privateRegistrySecret = authData;
    this.privateRegistrySecretData = secretData;
    return authData;
  }
}
