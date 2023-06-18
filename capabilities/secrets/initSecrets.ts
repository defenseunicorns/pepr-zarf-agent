import {
  Log
} from "pepr";
import { K8sAPI } from "../kubernetes-api";
import { V1Secret } from "@kubernetes/client-node";
import { ISecretData } from "../api-types";

export class InitSecrets {
  k8sApi: K8sAPI;

  zarfStateSecretName = "zarf-state";
  zarfStateSecretNamespace = "zarf";
  zarfStateSecretKeys = ["registryInfo"]
  privateRegistrySecretName = "private-registry";
  privateRegistrySecretNamespace = "zarf";
  privateRegistrySecretKeys = [".dockerconfigjson"];

  // TODO - type these
  zarfStateSecret: ISecretData;
  privateRegistrySecret: ISecretData;

  // authServiceNamespace = "authservice";
  // authServiceSecretName = "authservice";
  // authServiceConfigFileName = "config.json";

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
  async getZarfStateSecret(): Promise<ISecretData> {
    const secretData = await this.k8sApi.getSecretValues(
      this.zarfStateSecretName,
      this.zarfStateSecretNamespace,
      this.zarfStateSecretKeys
    );
    Log.info("Zarf state secret: ", JSON.stringify(secretData));
    this.zarfStateSecret = secretData;

    return secretData;
  }

  async getZarfPrivateRegistrySecret(): Promise<ISecretData> {
    const secretData = await this.k8sApi.getSecretValues(
      this.privateRegistrySecretName,
      this.privateRegistrySecretNamespace,
      this.privateRegistrySecretKeys
    );
    Log.info("Private registry secret: ", JSON.stringify(secretData, undefined, 2));
    this.privateRegistrySecret = secretData;

    return secretData;
  }


  // async buildAuthserviceSecret() {
  //   const missionSecrets = await this.k8sApi.getSecretsByPattern(
  //     "mission-",
  //     "authservice"
  //   );
  //   if (missionSecrets.length == 0) {
  //     return;
  //   }
  //   const authserviceConfig = await this.getAuthServiceSecret();

  //   authserviceConfig.chains = missionSecrets.map(secret => {
  //     const name = this.decodeBase64(secret, "name");
  //     const domain = this.decodeBase64(secret, "domain");
  //     const id = this.decodeBase64(secret, "id");
  //     return AuthserviceConfig.createSingleChain({
  //       id,
  //       name,
  //       hostname: `${name}.${domain}`,
  //       redirect_uri: this.decodeBase64(secret, "redirect_uri"),
  //       secret: this.decodeBase64(secret, "secret"),
  //     });
  //   });

  //   await this.k8sApi.createOrUpdateSecret(
  //     this.authServiceNamespace,
  //     this.authServiceSecretName,
  //     { [this.authServiceConfigFileName]: JSON.stringify(authserviceConfig) }
  //   );
  // }
}
