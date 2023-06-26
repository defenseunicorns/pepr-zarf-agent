import { IInitSecret } from "./api-types";
import { Log, PeprRequest, a } from "pepr";

export function UpdateContainerImages(
  pod: PeprRequest<a.Pod>,
  address: string
) {
  try {
    // transform ephemeral container images
    if (pod.Raw?.spec?.ephemeralContainers !== undefined) {
      pod.Raw.spec.ephemeralContainers.map(container => {
        let patched_image = ImageTransformHost(address, container.image);
        container.image = patched_image;
      });
    }

    // transform ephemeral container images
    if (pod.Raw?.spec?.initContainers !== undefined) {
      pod.Raw.spec.initContainers.map(container => {
        let patched_image = ImageTransformHost(address, container.image);
        container.image = patched_image;
      });
    }

    // transform container images
    pod.Raw.spec.containers.map(container => {
      let patched_image = ImageTransformHost(address, container.image);
      container.image = patched_image;
    });
  } catch (err) {
    Log.error("Could not add transform container images", err);
  }
}

function tableConstructedFromPolynomial(): number[] {
  const crc32Table: number[] = [];

  const polynomial = 0xedb88320; // CRC-32 polynomial (IEEE)

  for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let j = 0; j < 8; j++) {
      if ((crc & 1) === 1) {
        crc = (crc >>> 1) ^ polynomial;
      } else {
        crc >>>= 1;
      }
    }
    crc32Table[i] = crc >>> 0;
  }
  return crc32Table;
}

export function GetCRCHash(data: string): number {
  let crc32Table = tableConstructedFromPolynomial();
  let crc = 0xffffffff; // Initial CRC value

  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i) & 0xff;
    crc = (crc >>> 8) ^ crc32Table[(crc ^ byte) & 0xff];
  }

  crc ^= 0xffffffff; // Finalize CRC value
  return crc >>> 0; // Return as unsigned 32-bit integer
}

export function checkPattern(str: string, pattern: RegExp): boolean {
  return pattern.test(str);
}

export function ParseAnyReference(imageString: string) {
  const pattern = /^(?:([^/]+)\/)?([^:@]+)(?::([^@]+))?(?:@(.+))?$/;
  const matches = imageString.match(pattern);
  if (!matches) {
    throw new Error("Invalid image string");
  }

  let [, host, path, tag, digest] = matches;

  if (imageString.split("/").length == 2) {
    path = host + "/" + path;
    host = "";
  }
  return {
    host: host || "",
    path,
    tag: tag || "",
    digest: digest || "",
  };
}

export function ImageTransformHost(
  targetHost: string,
  srcReference: string
): string {
  let { host, path, tag, digest } = ParseAnyReference(srcReference);

  let err = new Error(
    "Unsupported image format. Please use fully qualified image name."
  );

  // check if there is a space in the srcReference
  if (srcReference.includes(" ") || srcReference.includes("\\")) {
    throw err;
  }
  // check for malformed srcReference
  if (checkPattern(srcReference, /^http/)) {
    throw err;
  }
  // step 1 - update the host
  let originalHost = host;
  if (originalHost === "") {
    originalHost = "docker.io";
  }

  host = targetHost;

  // step 2 - path
  if (srcReference.split("/").length === 1) {
    path = "library/" + path;
  }

  // step 3 - Generate a crc32 hash of the image host + name
  let checksum = GetCRCHash(originalHost + "/" + path);

  // step 4 - if tag is "" then use the latest
  if (tag === "") {
    tag = "latest";
  }
  // If this image is specified by digest then don't add a checksum it as it will already be a specific SHA
  if (digest !== "") {
    return `${host}/${path}@${digest}`;
  }

  return `${host}/${path}:${tag}-zarf-${checksum}`;
}
export function ImageTransformHostWithoutChecksum(
  targetHost: string,
  srcReference: string
): string {
  let { host, path, tag, digest } = ParseAnyReference(srcReference);

  let err = new Error(
    "Unsupported image format. Please use fully qualified image name."
  );

  // check if there is a space in the srcReference
  if (srcReference.includes(" ") || srcReference.includes("\\")) {
    throw err;
  }
  // check for malformed srcReference
  if (checkPattern(srcReference, /^http/)) {
    throw err;
  }
  // step 1 - update the host
  let originalHost = host;
  if (originalHost === "") {
    originalHost = "docker.io";
  }

  host = targetHost;

  // step 2 - path
  if (srcReference.split("/").length === 1) {
    path = "library/" + path;
  }

  // step 4 - if tag is "" then use the latest
  if (tag === "" && digest === "") {
    tag = "latest";
  }
  return `${host}/${path}${tag !== "" ? ":" + tag : ""}${
    digest !== "" ? "@" + digest : ""
  }`;
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

// Deprecated******************************************************

// export function BuildInternalImageURL(
//   image: string,
//   registryUrl: string
// ): string {
//   let err = new Error(
//     "Unsupported image format. Please use fully qualified image name."
//   );
//   if (checkPattern(image, /^http/)) {
//     throw err;
//   }
//   let image_sections = image.split("/");

//   if (image_sections.length >= 3) {
//     image_sections[0] = registryUrl;
//   } else if (image_sections.length === 2) {
//     image_sections.unshift(registryUrl);
//   } else if (image_sections.length === 1) {
//     image_sections.unshift(registryUrl, "library");
//   } else if (image_sections.length === 0) {
//     throw err;
//   }

//   return image_sections.join("/");
// }
// this is not necessary a.HasLabels("zarf-agent") is sufficient

// Deprecated******************************************************

// export function HasIgnoreLabels(req: PeprRequest<a.Pod>): boolean {
//   if (
//     req.Raw?.metadata?.labels?.["zarf-agent"] !== undefined ||
//     req.Raw?.metadata?.labels?.["zarf.dev/agent"] !== undefined
//   ) {
//     return true;
//   }
//   return false;
// }
