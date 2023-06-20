import { Log } from "pepr";
import {
  AppsV1Api,
  CoreV1Api,
  KubeConfig,
  V1Secret,
  PatchUtils
} from "@kubernetes/client-node";

import { fetchStatus } from "pepr";

export class K8sAPI {
  k8sApi: CoreV1Api;
  k8sAppsV1Api: AppsV1Api;

  constructor() {
    const kc = new KubeConfig();
    kc.loadFromDefault();
    this.k8sApi = kc.makeApiClient(CoreV1Api);
    this.k8sAppsV1Api = kc.makeApiClient(AppsV1Api);
  }
  async addImagePullSecretToPod(name: string, namespace: string, secretName: string): Promise<void> {
   try {
    const pod = await this.k8sApi.readNamespacedPod(name, namespace);

    const imagePullSecret = {
      name: secretName
    };

    if (!pod.body.spec.imagePullSecrets) {
      pod.body.spec.imagePullSecrets = [];
    }

    pod.body.spec.imagePullSecrets.push(imagePullSecret);

    const updatedPod = await this.k8sApi.replaceNamespacedPod(name, namespace, pod.body);
    Log.info('Pod updated successfully:', JSON.stringify(updatedPod.body));
  } catch (error) {
    Log.error('Error adding imagePullSecret to pod:', JSON.stringify(error.response.body));
  }
    // const patch = [
    //   {
    //     op: 'add',
    //     path: '/spec/imagePullSecrets',
    //     value: [
    //       {
    //         name: secretName
    //       }
    //     ]
    //   }
    // ];
    // const options = { "headers": { "Content-type": PatchUtils.PATCH_FORMAT_JSON_PATCH}};
    // return this.k8sApi.patchNamespacedPod(name, namespace, patch,undefined, undefined, undefined, undefined, undefined, options).then((response) => {
    //   Log.info('Pod patched successfully:'+ response.body);
    // })
    // .catch((error) => {
    //   Log.error('Error patching pod:', JSON.stringify(error.response.body));
    // });
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

  // async restartDeployment(name: string, namespace: string) {
  //   const patch = [
  //     {
  //       op: "add",
  //       path: "/spec/template/metadata/annotations/kubectl.kubernetes.io~1restartedAt",
  //       value: new Date().toISOString(),
  //     },
  //   ];

  //   await this.k8sAppsV1Api.patchNamespacedDeployment(
  //     name,
  //     namespace,
  //     patch,
  //     undefined,
  //     undefined,
  //     undefined,
  //     undefined,
  //     undefined,
  //     { headers: { "content-type": "application/json-patch+json" } }
  //   );
  // }

  // async getSecretsByPattern(pattern: string, namespace: string) {
  //   // Get all secrets in the namespace
  //   const secrets = await this.k8sApi.listNamespacedSecret(namespace);
  //   if (!secrets || !secrets.body || !secrets.body.items) {
  //     return [];
  //   }

  //   // Filter the secrets by the provided pattern
  //   const matchingSecrets = secrets.body.items.filter(
  //     secret =>
  //       secret.metadata &&
  //       secret.metadata.name &&
  //       secret.metadata.name.startsWith(pattern)
  //   );

  //   return matchingSecrets;
  // }

  async createOrUpdateSecret(
    name: string,
    namespace: string,
    secretData: Record<string, string>
  ) {
    // Prepare the Secret object
    const secret: V1Secret = {
      apiVersion: "v1",
      kind: "Secret",
      metadata: {
        name: name,
        namespace: namespace,
      },
      data: {},
    };

    // Convert all the secretData values to base64 and add them to the Secret object
    for (const key in secretData) {
      secret.data[key] = Buffer.from(secretData[key]).toString("base64");
    }

    try {
      // Check if the Secret exists
      await this.k8sApi.readNamespacedSecret(name, namespace);

      // If the Secret exists, update it
      await this.k8sApi.replaceNamespacedSecret(name, namespace, secret);
    } catch (e) {
      if (e.response && e.response.statusCode === fetchStatus.NOT_FOUND) {
        // If the Secret doesn't exist, create it
        await this.k8sApi.createNamespacedSecret(namespace, secret);
      } else {
        throw e;
      }
    }
  }
}
