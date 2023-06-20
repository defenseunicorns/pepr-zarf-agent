import { IInitSecret } from "./api-types";
import { Log, PeprRequest, a } from "pepr";

export function BuildInternalImageURL(image: string, registryUrl: string): string {
  let image_sections = image.split('/');
  if (image_sections.length === 3) {
    image_sections[0] = registryUrl;
  } else if (image_sections.length === 2) {
    throw new Error('Unsupported image format. Please use fully qualified image name.');
  }
  else if (image_sections.length === 1) {
    image_sections.unshift(registryUrl, 'library');
  }

  return image_sections.join('/');
}
// this is not necessary a.HasLabels("zarf-agent") is sufficient
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
