import { PeprRequest, a } from "pepr";
import { IInitSecret, Operation, Request } from "./api-types";
import { HasIgnoreLabels, InitSecretsReady } from "./helpers";

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

  // Populate secrets
  let secrets = {
    privateRegistrySecret: { zarf: "air-gap" },
    zarfStateSecret: { pepr: "admission-controller" },
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
