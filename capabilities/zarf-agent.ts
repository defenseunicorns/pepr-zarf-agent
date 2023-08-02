import { Capability, a, Log } from "pepr";
import { K8sAPI } from "./kubernetes-api";
import { InitSecrets } from "./secrets/initSecrets";
import { InitSecretsReady } from "./helpers";
import { TransformerAPI } from "./transformer-api";

/**
 *  The ZarfAgent capability handles pod mutations for Zarf.
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
 * Initialize InitSecrets & TransformerAPI
 */
const _initSecrets = new InitSecrets(new K8sAPI());
const _transformer = new TransformerAPI();
// Initialize TransformerAPI & fetch Secrets
// Watch will take over secrets eventually
(async ()=>{
  Log.SetLogLevel("debug");
  await _initSecrets.getZarfStateSecret();
  await _initSecrets.getZarfPrivateRegistrySecret();
  await _transformer.run();
})()


/**
 * ---------------------------------------------------------------------------------------------------
 *                                   CAPABILITY ACTION (Zarf-Agent)                                   *
 * ---------------------------------------------------------------------------------------------------
 *
 * This Capability Action fetches the `zarf-state` and `private-registry` secrets. It transformed
 * pods and Argo Apps to meet internal requirements for working with Zarf.
 */

When(a.GenericKind, {
  group: "argoproj.io",
  version: "v1alpha1",
  kind: "Application",//(s) double check this
})
.IsCreatedOrUpdated()
.Then(app => {
  try {
    app.Raw = JSON.parse(
      _transformer.transformArgoApp(
        app.Raw,
        app.Request,
        _initSecrets.zarfStateSecret.gitServer.address,
        _initSecrets.zarfStateSecret.gitServer.pushUsername
      )
    )
  } catch (err) {
    Log.error("Error transforming app", err)
  }
  console.log("app", JSON.stringify(app, undefined, 2));
})

When(a.Pod)
  .IsCreatedOrUpdated()
  .Then(async pod => {
    try {
      // Parse output of transformPod to replace pod.Raw
      pod.Raw = JSON.parse(
        _transformer.transformPod(
          pod.Raw,
          pod.Request,
          _initSecrets.privateRegistrySecretName,
          _initSecrets.zarfStateSecret.registryInfo.address
        )
      );
    } catch (err) {
      Log.error("Error transforming pod", err);
    }
    console.log("pod", JSON.stringify(pod, undefined, 2));
  });
