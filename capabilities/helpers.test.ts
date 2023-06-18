import { IInitSecret } from "./api-types";
import { InitSecretsReady } from "./helpers";

// Initialize empty initSecrets
let _initSecrets: IInitSecret;
let emptySecrets: IInitSecret;


// Class to create initSecrets
class CreateInitSecret<T> {
  initSecrets: T;
  constructor(init: T) {
    this.initSecrets = init
  }
}
describe('InitSecretsReady function', () => {
  test('returns false when secrets are empty', () => {
    expect(InitSecretsReady(emptySecrets)).toBe(false);
  });

  // Populate secrets
  let secrets = {
    privateRegistrySecret: { "zarf": "air-gap" },
    zarfStateSecret: { "pepr": "admission-controller" }
  };
  _initSecrets = new CreateInitSecret<IInitSecret>(secrets).initSecrets


  test('returns true when secrets are populated', () => {
    expect(InitSecretsReady(_initSecrets)).toBe(true);
  });
});
