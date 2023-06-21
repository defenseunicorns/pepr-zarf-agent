import { PeprRequest, a } from "pepr";
import { IInitSecret, Operation, Request } from "./api-types";
import {
  HasIgnoreLabels,
  InitSecretsReady,
  BuildInternalImageURL,
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
let operation: Operation = Operation.CREATE;
let noLabels: Request<a.Pod> = {
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

let withLabels: Request<a.Pod> = {
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
let withoutIgnoreLabelsPod = new PeprRequest<any>(noLabels);

let ignoreLabelsPod = new PeprRequest<any>(withLabels);

describe("InitSecretsReady function", () => {
  test("returns false when secrets are not initialized", () => {
    expect(InitSecretsReady(emptySecrets)).toBe(false);
  });

  // Populates secrets
  let secrets: IInitSecret = {
    privateRegistrySecret: {
      auths: { }
    },
    zarfStateSecret: {
      agentTLS: {
        ca: "",
        cert: "",
        key: ""
      },
      architecture: "",
      artifactServer: {
        address: "",
        internalServer: false,
        pushPassword: "",
        pushUsername: ""
      },
      distro: "",
      gitServer: {
        address: "",
        internalServer: false,
        pullPassword: "",
        pullUsername: "",
        pushPassword: "",
        pushUsername: ""
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
        secret: ""
      },
      storageClass: "",
      zarfAppliance: false
    }
  };
  
  nonemptySecrets = new CreateInitSecret<IInitSecret>(secrets).initSecrets;

  test("returns true when secrets are initialized", () => {
    expect(InitSecretsReady(nonemptySecrets)).toBe(true);
  });
});

// TODO - test HasIgnoreLabels
describe("HasIgnoreLabels function", () => {
  test("returns false when pod has no ignore labels", () => {
    expect(HasIgnoreLabels(withoutIgnoreLabelsPod)).toBe(false);
  });

  test("returns true when pod has ignore labels", () => {
    expect(HasIgnoreLabels(ignoreLabelsPod)).toBe(true);
  });
});

describe("BuildInternalImageURL", () => {
  it("should build the internal image URL correctly for a three-section image", () => {
    const image = "my-image:latest";
    const registryUrl = "127.0.0.1:31999";

    const result = BuildInternalImageURL(image, registryUrl);

    expect(result).toBe("127.0.0.1:31999/library/my-image:latest");
  });

  it("should throw an error for a two-section image", () => {
    const image = "docker.io/my-image:latest";
    const registryUrl = "127.0.0.1:31999";

    expect(() => {
      BuildInternalImageURL(image, registryUrl);
    }).toThrow(Error);
  });

  it("should build the internal image URL correctly for a one-section image", () => {
    const image = "my-image:latest";
    const registryUrl = "127.0.0.1:31999";

    const result = BuildInternalImageURL(image, registryUrl);

    expect(result).toBe("127.0.0.1:31999/library/my-image:latest");
  });
});
