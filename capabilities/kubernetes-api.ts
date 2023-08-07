import {
  AppsV1Api,
  CoreV1Api,
  KubeConfig,
} from "@kubernetes/client-node";

export class K8sAPI {
  k8sApi: CoreV1Api;
  k8sAppsV1Api: AppsV1Api;

  constructor() {
    const kc = new KubeConfig();
    kc.loadFromDefault();
    this.k8sApi = kc.makeApiClient(CoreV1Api);
    this.k8sAppsV1Api = kc.makeApiClient(AppsV1Api);
  }

  async getSecretValues(
    name: string,
    namespace: string,
    keys: string[]
  ): Promise<{ [key: string]: string }> {
    const response = await this.k8sApi.readNamespacedSecret(name, namespace);
    const secret = response.body.data;
    const secretValues: { [key: string]: string } = {};

    if (secret) {
      keys.forEach(key => {
        if (secret[key]) {
          // Decode the base64 encoded secret value
          const decodedValue = Buffer.from(secret[key], "base64").toString(
            "utf-8"
          );
          secretValues[key] = decodedValue;
        } else {
          throw new Error(`Could not find key '${key}' in the secret ${name}`);
        }
      });
      return secretValues;
    }
    throw new Error(`Could not retrieve the secret ${name}`);
  }
}
