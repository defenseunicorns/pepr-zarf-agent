import { IInitSecret } from "./api-types";
import { Log, PeprRequest, a } from "pepr";

export function HasIgnoreLabels(req: PeprRequest<a.Pod>): boolean {
  if (
    req.Raw?.metadata?.labels?.["zarf-agent"] !== undefined ||
    req.Raw?.metadata?.labels?.["zarf.dev/agent"] !== undefined
  ) {
    return true;
  }
  return false;
}
export function InitSecretsReady(_initSecrets: IInitSecret): boolean {
  let found: boolean = false;
  try {
    Log.info("Checking init secrets");
    if (!_initSecrets.privateRegistrySecret || !_initSecrets.zarfStateSecret) {
      Log.info("Init secrets not initialized");
      found = false;
    } else {
      Log.info("Init secrets initialized");
      found = true;
    }
  } catch {
    Log.info("Init secrets not initialized");
    return found;
  }

  return found;
}
