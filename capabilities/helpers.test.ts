import { a, PeprMutateRequest } from "pepr";
import { IInitSecret, Operation, Request } from "./api-types";
import {
  // HasIgnoreLabels, Deprecated
  InitSecretsReady,
  checkPattern,
  // BuildInternalImageURL, Deprecated
  ImageTransformHost,
  ParseAnyReference,
  GetCRCHash,
  UpdateContainerImages,
  ImageTransformHostWithoutChecksum,
} from "./helpers";

// Initialize empty initSecrets
let nonemptySecrets: IInitSecret;
let emptySecrets: IInitSecret;

// Class to create initSecrets
class CreateInitSecret<T> {
  initSecrets: T;
  constructor(init: T) {
    this.initSecrets = init;
  }
}
const operation: Operation = Operation.CREATE;
const multiContainerPod: Request<a.Pod> = {
  operation: operation,
  uid: "1234",
  kind: {
    kind: "Pod",
    group: "",
    version: "v1",
  },
  resource: {
    group: "",
    version: "v1",
    resource: "pods",
  },
  userInfo: {
    username: "test",
  },
  object: {
    spec: {
      containers: [
        {
          image: "nginx",
          name: "container",
        },
      ],
      initContainers: [
        {
          image: "nginx",
          name: "initContainer",
        },
      ],
      ephemeralContainers: [
        {
          image: "nginx",
          name: "ephemeralContainer",
        },
      ],
    },
  },
  name: "multiContainerPod",
  namespace: "default",
};

const singleContainerPod: Request<a.Pod> = {
  operation: operation,
  uid: "1234",
  kind: {
    kind: "Pod",
    group: "",
    version: "v1",
  },
  resource: {
    group: "",
    version: "v1",
    resource: "pods",
  },
  userInfo: {
    username: "test",
  },
  object: {
    spec: {
      containers: [
        {
          image: "nginx",
          name: "container",
        },
      ],
    },
  },
  name: "singleContainerPod",
  namespace: "default",
};

/*
const noLabels: Request<a.Pod> = {
  operation: operation,
  uid: "1234",
  kind: {
    kind: "Pod",
    group: "",
    version: "v1",
  },
  resource: {
    group: "",
    version: "v1",
    resource: "pods",
  },
  userInfo: {
    username: "test",
  },
  object: {},
  name: "test",
  namespace: "default",
};

const withLabels: Request<a.Pod> = {
  operation: operation,
  uid: "1234",
  kind: {
    kind: "Pod",
    group: "",
    version: "v1",
  },
  resource: {
    group: "",
    version: "v1",
    resource: "pods",
  },
  userInfo: {
    username: "test",
  },
  object: {
    metadata: {
      labels: {
        "zarf-agent": "ignore",
      },
    },
  },
  name: "test",
  namespace: "default",
};
*/
//const withoutIgnoreLabelsPod = new PeprMutateRequest<a.Pod>(noLabels);

//const ignoreLabelsPod = new PeprMutateRequest<a.Pod>(withLabels);

describe("InitSecretsReady function", () => {
  test("returns false when secrets are not initialized", () => {
    expect(InitSecretsReady(emptySecrets)).toBe(false);
  });

  // Populates secrets
  const secrets: IInitSecret = {
    privateRegistrySecret: {
      auths: {},
    },
    zarfStateSecret: {
      agentTLS: {
        ca: "",
        cert: "",
        key: "",
      },
      architecture: "",
      artifactServer: {
        address: "",
        internalServer: false,
        pushPassword: "",
        pushUsername: "",
      },
      distro: "",
      gitServer: {
        address: "",
        internalServer: false,
        pullPassword: "",
        pullUsername: "",
        pushPassword: "",
        pushUsername: "",
      },
      loggingSecret: "",
      registryInfo: {
        address: "",
        internalRegistry: false,
        nodePort: 0,
        pullPassword: "",
        pullUsername: "",
        pushPassword: "",
        pushUsername: "",
        secret: "",
      },
      storageClass: "",
      zarfAppliance: false,
    },
  };

  nonemptySecrets = new CreateInitSecret<IInitSecret>(secrets).initSecrets;

  test("returns true when secrets are initialized", () => {
    expect(InitSecretsReady(nonemptySecrets)).toBe(true);
  });
});

describe("checkPattern", () => {
  it("should return true if the beginning string matches the pattern", () => {
    const str = "http://urls.are/not/refs";
    const pattern = /^http/;
    const isMatch = checkPattern(str, pattern);
    expect(isMatch).toBe(true);
  });

  it("should return false if the beginning string does not match the pattern", () => {
    const str = "dhttp://urls.are/not/refs";
    const pattern = /^http/;
    const isMatch = checkPattern(str, pattern);
    expect(isMatch).toBe(false);
  });
});

describe("ParseAnyReference", () => {
  const imageRefs = [
    "nginx",
    "nginx:1.23.3",
    "defenseunicorns/zarf-agent:v0.22.1",
    "defenseunicorns/zarf-agent@sha256:84605f731c6a18194794c51e70021c671ab064654b751aa57e905bce55be13de",
    "ghcr.io/stefanprodan/podinfo:6.3.3",
    "registry1.dso.mil/ironbank/opensource/defenseunicorns/zarf/zarf-agent:v0.25.0",
  ];

  it("parses valid image references correctly", () => {
    const parsedRefs = imageRefs.map(ref => {
      return ParseAnyReference(ref);
    });

    const expectedResult = [
      {
        host: "",
        path: "nginx",
        tag: "",
        digest: "",
      },
      {
        host: "",
        path: "nginx",
        tag: "1.23.3",
        digest: "",
      },
      {
        host: "",
        path: "defenseunicorns/zarf-agent",
        tag: "v0.22.1",
        digest: "",
      },
      {
        host: "",
        path: "defenseunicorns/zarf-agent",
        tag: "",
        digest:
          "sha256:84605f731c6a18194794c51e70021c671ab064654b751aa57e905bce55be13de",
      },
      {
        host: "ghcr.io",
        path: "stefanprodan/podinfo",
        tag: "6.3.3",
        digest: "",
      },
      {
        host: "registry1.dso.mil",
        path: "ironbank/opensource/defenseunicorns/zarf/zarf-agent",
        tag: "v0.25.0",
        digest: "",
      },
    ];

    expect(parsedRefs).toEqual(expectedResult);
  });
});

describe("GetCRCHash", () => {
  const inputs = [
    "docker.io/library/nginx",
    "docker.io/library/nginx",
    "docker.io/defenseunicorns/zarf-agent",
    "ghcr.io/stefanprodan/podinfo",
    "registry1.dso.mil/ironbank/opensource/defenseunicorns/zarf/zarf-agent",
  ];
  const expectedOutputs = [
    "3793515731",
    "3793515731",
    "4283503412",
    "2985051089",
    "2003217571",
  ];

  it("creates the correct crc32 hashes", () => {
    const hashedInputs = inputs.map(ref => {
      return GetCRCHash(ref).toString();
    });
    expect(hashedInputs).toEqual(expectedOutputs);
  });
});

describe("ImageTransformHost", () => {
  const imageRefs = [
    "nginx",
    "nginx:1.23.3",
    "defenseunicorns/zarf-agent:v0.22.1",
    "defenseunicorns/zarf-agent@sha256:84605f731c6a18194794c51e70021c671ab064654b751aa57e905bce55be13de",
    "ghcr.io/stefanprodan/podinfo:6.3.3",
    "registry1.dso.mil/ironbank/opensource/defenseunicorns/zarf/zarf-agent:v0.25.0",
  ];

  const expectedResult = [
    // Normal git repos and references for pushing/pulling
    "gitlab.com/project/library/nginx:latest-zarf-3793515731",
    "gitlab.com/project/library/nginx:1.23.3-zarf-3793515731",
    "gitlab.com/project/defenseunicorns/zarf-agent:v0.22.1-zarf-4283503412",
    "gitlab.com/project/defenseunicorns/zarf-agent@sha256:84605f731c6a18194794c51e70021c671ab064654b751aa57e905bce55be13de",
    "gitlab.com/project/stefanprodan/podinfo:6.3.3-zarf-2985051089",
    "gitlab.com/project/ironbank/opensource/defenseunicorns/zarf/zarf-agent:v0.25.0-zarf-2003217571",
  ];

  const badImageRefs = [
    "i am not a ref at all",
    "C:\\Users\\zarf",
    "http://urls.are/not/refs",
  ];

  test("transforms valid image references correctly", () => {
    const transformedRefs = imageRefs.map(ref => {
      return ImageTransformHost("gitlab.com/project", ref);
    });

    expect(transformedRefs).toEqual(expectedResult);
  });

  test("throws errors for invalid image references", () => {
    const invalidRefs = badImageRefs.map(ref => {
      return () => {
        ImageTransformHost("gitlab.com/project", ref);
      };
    });

    invalidRefs.forEach(invalidRef => {
      expect(invalidRef).toThrow(Error);
    });
  });
});

describe("ImageTransformHostWithoutChecksum", () => {
  const imageRefs = [
    "nginx",
    "nginx:1.23.3",
    "defenseunicorns/zarf-agent:v0.22.1",
    "defenseunicorns/zarf-agent@sha256:84605f731c6a18194794c51e70021c671ab064654b751aa57e905bce55be13de",
    "ghcr.io/stefanprodan/podinfo:6.3.3",
    "registry1.dso.mil/ironbank/opensource/defenseunicorns/zarf/zarf-agent:v0.25.0",
  ];

  const expectedResult = [
    "gitlab.com/project/library/nginx:latest",
    "gitlab.com/project/library/nginx:1.23.3",
    "gitlab.com/project/defenseunicorns/zarf-agent:v0.22.1",
    "gitlab.com/project/defenseunicorns/zarf-agent@sha256:84605f731c6a18194794c51e70021c671ab064654b751aa57e905bce55be13de",
    "gitlab.com/project/stefanprodan/podinfo:6.3.3",
    "gitlab.com/project/ironbank/opensource/defenseunicorns/zarf/zarf-agent:v0.25.0",
  ];

  const badImageRefs = [
    "i am not a ref at all",
    "C:\\Users\\zarf",
    "http://urls.are/not/refs",
  ];

  test("transforms valid image references correctly", () => {
    const transformedRefs = imageRefs.map(ref => {
      return ImageTransformHostWithoutChecksum("gitlab.com/project", ref);
    });

    expect(transformedRefs).toEqual(expectedResult);
  });

  test("throws errors for invalid image references", () => {
    const invalidRefs = badImageRefs.map(ref => {
      return () => {
        ImageTransformHostWithoutChecksum("gitlab.com/project", ref);
      };
    });

    invalidRefs.forEach(invalidRef => {
      expect(invalidRef).toThrow(Error);
    });
  });
});

describe("UpdateContainerImages", () => {
  // pods
  const mutliContainer = new PeprMutateRequest<a.Pod>(multiContainerPod);
  const singleContainer = new PeprMutateRequest<a.Pod>(singleContainerPod);

  // expected image
  const expectedImage = "127.0.0.1:31999/library/nginx:latest-zarf-3793515731";

  // internalRegistryAddress
  const address = "127.0.0.1:31999";

  test("updates container images correctly on pods with init and ephemeral containers", () => {
    UpdateContainerImages(mutliContainer, address);

    expect(mutliContainer.Raw?.spec?.containers?.[0].image).toBe(expectedImage);
    expect(mutliContainer.Raw?.spec?.initContainers?.[0].image).toBe(
      expectedImage,
    );
    expect(mutliContainer.Raw?.spec?.ephemeralContainers?.[0].image).toBe(
      expectedImage,
    );
  });

  test("updates container images correctly on pods with only containers", () => {
    UpdateContainerImages(singleContainer, address);

    expect(singleContainer.Raw?.spec?.containers?.[0].image).toBe(
      expectedImage,
    );
    expect(singleContainer.Raw?.spec?.initContainers).toBe(undefined);
    expect(singleContainer.Raw?.spec?.ephemeralContainers).toBe(undefined);
  });
});

// Deprecated
// describe("HasIgnoreLabels function", () => {
//   test("returns false when pod has no ignore labels", () => {
//     expect(HasIgnoreLabels(withoutIgnoreLabelsPod)).toBe(false);
//   });

//   test("returns true when pod has ignore labels", () => {
//     expect(HasIgnoreLabels(ignoreLabelsPod)).toBe(true);
//   });
// });
//
// describe("BuildInternalImageURL", () => {
//   it("should build the internal image URL correctly for a three-section image", () => {
//     const image = "my-image:latest";
//     const registryUrl = "127.0.0.1:31999";

//     const result = BuildInternalImageURL(image, registryUrl);

//     expect(result).toBe("127.0.0.1:31999/library/my-image:latest");
//   });

//   it("should throw an error for a malformed image", () => {
//     const image = "http://docker.io/my-image:latest";
//     const registryUrl = "127.0.0.1:31999";

//     expect(() => {
//       BuildInternalImageURL(image, registryUrl);
//     }).toThrow(Error);
//   });

//   it("should build the internal image URL correctly for a one-section image", () => {
//     const image = "my-image:latest";
//     const registryUrl = "127.0.0.1:31999";

//     const result = BuildInternalImageURL(image, registryUrl);

//     expect(result).toBe("127.0.0.1:31999/library/my-image:latest");
//   });
// });
