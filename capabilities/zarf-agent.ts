import {
  Capability,
  PeprRequest,
  RegisterKind,
  a,
  Log,
  fetch,
  fetchStatus,
} from "pepr";
import { K8sAPI } from "./kubernetes-api";
import { InitSecrets } from "./secrets/initSecrets";

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
    Log.info("Private Registry Secret", JSON.stringify(_initSecrets.privateRegistrySecret, undefined, 2));
  })

When(a.Pod)
  .IsCreated()
  .Then(async request => {
    Log.SetLogLevel("debug");
    try {

      // _initSecrets = new InitSecrets(k8sApi);
      //await _initSecrets.getZarfStateSecret();
      await _initSecrets.getZarfPrivateRegistrySecret()

      Log.info(`Does logging work??`)

    }
    catch (err) {
      Log.error("Secrets in zarf namespace do not exist", err);

    }

  });
