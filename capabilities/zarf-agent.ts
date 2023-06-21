import { Capability, a, Log } from "pepr";
import { K8sAPI } from "./kubernetes-api";
import { InitSecrets } from "./secrets/initSecrets";
import { InitSecretsReady, BuildInternalImageURL } from "./helpers";
/**
 *  The HelloPepr Capability is an example capability to demonstrate some general concepts of Pepr.
 *  To test this capability you can run `pepr dev` or `npm start` and then run the following command:
 *  `kubectl apply -f capabilities/hello-pepr.samples.yaml`
 */
export const ZarfAgent = new Capability({
  name: "zarf-agent",
  description: "A mutating webhook for Zarf.",
  namespaces: [], // all namespaces
});

// Use the 'When' function to create a new Capability Action
const { When } = ZarfAgent;

/**
 * ---------------------------------------------------------------------------------------------------
 * Initialize InitSecrets
 */
let _initSecrets = new InitSecrets(new K8sAPI());

/**
 * ---------------------------------------------------------------------------------------------------
 *                                   CAPABILITY ACTION (Pod)                                   *
 * ---------------------------------------------------------------------------------------------------
 *
 * This Capability Action fetches the `zarf-state` and `private-registry` secrets when
 * a pod is created, saves them to state, and deploys the `private-registry` secret to the
 * pod namespace.
 */
When(a.ConfigMap)
  .IsCreated()
  .Then(() => {
    Log.info(
      "Private Registry Secret",
      JSON.stringify(_initSecrets.privateRegistrySecret, undefined, 2)
    );
    Log.info(
      "Zarf State Secret",
      JSON.stringify(_initSecrets.zarfStateSecret, undefined, 2)
    );
  });

When(a.Pod)
  .IsCreated()
  .Then(async pod => {
    // Turn up logging
    Log.SetLogLevel("debug");

    // If InitSecrets do not exist, create them
    if (!InitSecretsReady(_initSecrets)) {
      try {
        await _initSecrets.getZarfStateSecret();
        await _initSecrets.getZarfPrivateRegistrySecret();

        Log.info(`InitSecrets initialized. 💯`);
      } catch (err) {
        Log.error("Secrets in zarf namespace do not exist", err);
      }
    }

    // Create a imagePullSecret in Pod namespace
    if (pod.HasLabel("zarf-agent") || pod.HasLabel("zarf.dev/agent")) {
      Log.info("Pod has ignore labels. Skipping.");
    } else {
      let newSecret = {
        ".dockerconfigjson":
          _initSecrets.privateRegistrySecret[".dockerconfigjson"],
      };
      Log.info("Pod does not have ignore labels. Continuing.");
      try {
        // create imagePullSecret in pod namespace
        await _initSecrets.k8sApi.createOrUpdateSecret(
          _initSecrets.privateRegistrySecretName,
          pod.Raw?.metadata?.namespace,
          newSecret
        );
        Log.info(
          "imagePullSecret secret created in " +
            pod.Raw?.metadata?.namespace +
            " namespace. "
        );
      } catch (err) {
        Log.error("Could not create imagePullSecret in pod namespace", err);
      }
      // Add imagePullSecret to Pod
      try {
        pod.Raw.spec.imagePullSecrets = [];
        // check if imagePullSecrets exist
        if (pod.Raw?.spec?.imagePullSecrets !== undefined) {
          pod.Raw.spec.imagePullSecrets = [];
        }
        // add imagePullSecret to pod
        pod.Raw?.spec?.imagePullSecrets?.push({
          name: _initSecrets.privateRegistrySecretName,
        });

        // if ephemeral containers exist - build BuildInternalImageURL
        if (pod.Raw?.spec?.ephemeralContainers !== undefined) {
          pod.Raw.spec.containers.map(container => {
            let patched_image = BuildInternalImageURL(
              container.image,
              _initSecrets.zarfStateSecret.registryInfo.address
            );
            container.image = patched_image;
          });
        }

        // check if init containers exist - build BuildInternalImageURL
        if (pod.Raw?.spec?.initContainers !== undefined) {
          pod.Raw.spec.containers.map(container => {
            let patched_image = BuildInternalImageURL(
              container.image,
              _initSecrets.zarfStateSecret.registryInfo.address
            );
            container.image = patched_image;
          });
        }
      } catch (err) {
        Log.error("Could not add imagePullSecret to pod", err);
      }

      try {
        //  containers - build BuildInternalImageURL
        pod.Raw.spec.containers.map(container => {
          let patched_image = BuildInternalImageURL(
            container.image,
            _initSecrets.zarfStateSecret.registryInfo.address
          );
          container.image = patched_image;
        });

        // add zarf-agent label to pod to be ignored next time
        pod.SetAnnotation("zarg-agent/dev", "patched");
      } catch (err) {
        Log.error("Could not patch image of pod", err);
      }
    }
  });
