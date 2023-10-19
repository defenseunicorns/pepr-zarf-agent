import { Log, K8s, kind } from "pepr";

export class K8sAPI {
  constructor() {}

  async addImagePullSecretToPod(
    name: string,
    namespace: string,
    secretName: string,
  ): Promise<void> {
    try {
      K8s(kind.Pod, { name: name, namespace: namespace })
        .Patch([
          {
            op: "replace",
            path: "/spec/imagePullSecrets",
            value: [
              {
                name: secretName,
              },
            ],
          },
        ])
        .then(() => {
          Log.info("Pod patched successfully.");
        })
        .catch(error => {
          Log.error("Error patching pod:", JSON.stringify(error.response.body));
        });
    } catch (err) {
      Log.error("Could not add imagePullSecret to pod", err);
    }
    //   this.k8sApi.readNamespacedPod(name, namespace)
    //     .then(({ body: pod }) => {
    //       // Append the new imagePullSecret to the existing imagePullSecrets array
    //       const updatedImagePullSecrets = pod.spec.imagePullSecrets || [];
    //       updatedImagePullSecrets.push({ name: secretName });

    //       // Update the pod with the modified imagePullSecrets
    //       pod.spec.imagePullSecrets = updatedImagePullSecrets;

    //       return this.k8sApi.replaceNamespacedPod(name, namespace, pod);
    //     })
    //     .then(() => {
    //       Log.info('Pod updated successfully.');
    //     })
    //     .catch((error) => {
    //       Log.error('Error updating pod:', JSON.stringify(error.response.body));
    //     });
    // } catch (err) {
    //   Log.error("Could not add imagePullSecret to pod", err);
    // }
  }
  // TODO: replace with a Secret Class that properly handles the base64 encoding
  async getSecretValues(
    name: string,
    namespace: string,
    keys: string[],
  ): Promise<{ [key: string]: string }> {
    const secret = await K8s(kind.Secret).InNamespace(namespace).Get(name);
    const secretValues: { [key: string]: string } = {};

    if (secret) {
      keys.forEach(key => {
        if (secret[key]) {
          // Decode the base64 encoded secret value
          const decodedValue = Buffer.from(secret[key], "base64").toString(
            "utf-8",
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

  // TODO: replace with a Secret Class that properly handles the base64 encoding
  async createOrUpdateSecret(
    name: string,
    namespace: string,
    secretData: Record<string, string>,
  ) {
    // Prepare the Secret object
    const secret: kind.Secret = {
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

    await K8s(kind.Secret).Apply(secret, { force: true });
  }
}
