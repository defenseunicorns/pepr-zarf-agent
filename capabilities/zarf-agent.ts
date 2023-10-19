import { Capability, a, Log } from "pepr";
import { K8sAPI } from "./kubernetes-api";
import { InitSecrets } from "./secrets/initSecrets";
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
 * Initialize InitSecrets & TransformerAPI
 */
const _initSecrets = new InitSecrets(new K8sAPI());
const _transformer = new TransformerAPI();

/**
 * Initialize TransformerAPI & fetch Secrets
 */
(async () => {
  Log.SetLogLevel("debug");

  try {
    await Promise.all([
      _initSecrets.getZarfStateSecret(),
      _initSecrets.getZarfPrivateRegistrySecret(),
      _transformer.run(),
    ]);
    Log.info("Initialized TransformerAPI and fetched Secrets");
  } catch (error) {
    Log.error("Could not initialize TransformerAPI and fetch Secrets:", error);
  }
})();

/**
 * ---------------------------------------------------------------------------------------------------
 *                                   CAPABILITY ACTION (Zarf-Agent)                                   *
 * ---------------------------------------------------------------------------------------------------
 *
 * This Capability Action fetches the `zarf-state` and `private-registry` secrets. It transformed
 * pods and Argo Apps to meet internal requirements for working with Zarf.
 */

When(a.GenericKind, {
  group: "source.toolkit.fluxcd.io",
  version: "v1beta2",
  kind: "GitRepository",
  plural: "gitrepositories",
})
  .IsCreatedOrUpdated()
  .Then((gitRepo) => {
    delete gitRepo.Raw?.finalizers;
    try {
      gitRepo.Raw = JSON.parse(
        _transformer.transformFluxApp(
          gitRepo.Raw,
          gitRepo.Request,
          _initSecrets.zarfStateSecret.gitServer.address,
          _initSecrets.zarfStateSecret.gitServer.pushUsername,
        ),
      );
      console.log(JSON.stringify(gitRepo.Raw, undefined, 2));
    } catch (err) {
      Log.error("Error transforming gitRepo", err);
    }
  });

When(a.GenericKind, {
  group: "argoproj.io",
  version: "v1alpha1",
  kind: "Application",
})
  .IsCreatedOrUpdated()
  .Then((app) => {
    delete app.Raw?.finalizers;
    try {
      app.Raw = JSON.parse(
        _transformer.transformArgoApp(
          app.Raw,
          app.Request,
          _initSecrets.zarfStateSecret.gitServer.address,
          _initSecrets.zarfStateSecret.gitServer.pushUsername,
        ),
      );
    } catch (err) {
      Log.error("Error transforming app", err);
    }
  });

When(a.Pod)
  .IsCreatedOrUpdated()
  .Then(async (pod) => {
    try {
      pod.Raw = JSON.parse(
        _transformer.transformPod(
          pod.Raw,
          pod.Request,
          _initSecrets.privateRegistrySecretName,
          _initSecrets.zarfStateSecret.registryInfo.address,
        ),
      );
    } catch (err) {
      Log.error("Error transforming pod", err);
    }
  });

When(a.Secret)
  .IsCreatedOrUpdated()
  .InNamespace("argocd")
  .WithLabel("argocd.argoproj.io/secret-type", "repository")
  .Then((secret) => {
    secret.Raw = JSON.parse(
      _transformer.transformArgoSecret(
        secret.Raw,
        secret.Request,
        _initSecrets.zarfStateSecret.gitServer.address,
        _initSecrets.zarfStateSecret.gitServer.pushUsername,
        _initSecrets.zarfStateSecret.gitServer.pullPassword,
        _initSecrets.zarfStateSecret.gitServer.pullUsername,
      ),
    );
  });

When(a.Secret)
  .IsCreatedOrUpdated()
  .InNamespace("zarf")
  .WithName("private-registry")
  .Then(
    (secret) =>
      (_initSecrets.privateRegistrySecret = JSON.parse(
        secret.Raw.data[".dockerconfig.json"],
      )),
  );

When(a.Secret)
  .IsCreatedOrUpdated()
  .InNamespace("zarf")
  .WithName("zarf-state")
  .Then(
    (secret) =>
      (_initSecrets.zarfStateSecret = JSON.parse(secret.Raw?.data?.state)),
  );
