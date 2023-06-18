import {
  Log
} from "pepr";
import { K8sAPI } from "../kubernetes-api";
import { V1Secret } from "@kubernetes/client-node";

export class InitSecrets {
  k8sApi: K8sAPI;

  zarfStateSecretName = "zarf-state";
  zarfStateSecretNamespace = "zarf";
  zarfStateSecretKeys = ["registryInfo"]
  privateRegistrySecretName = "private-registry";
  privateRegistrySecretNamespace = "zarf";
  privateRegistrySecretKeys = [".dockerconfigjson"];

  // TODO - type these
  zarfStateSecret: any;
  privateRegistrySecret: any;

  // authServiceNamespace = "authservice";
  // authServiceSecretName = "authservice";
  // authServiceConfigFileName = "config.json";

  constructor(k8sApi: K8sAPI) {
    this.k8sApi = k8sApi;
  }

  private decodeBase64(secret: V1Secret, key: string): string {
    if (!secret.data) {
      throw new Error("Data is missing in secret");
    }
    if (!secret.data[key]) {
      throw new Error(`Key ${key} is missing in secret`);
    }
    return Buffer.from(secret.data[key], "base64").toString("utf-8");
  }

  // TODO type this
  async getZarfStateSecret(): Promise<any> {
    const secretData = await this.k8sApi.getSecretValues(
      this.zarfStateSecretName,
      this.zarfStateSecretNamespace,
      this.zarfStateSecretKeys
    );
      Log.info("Zarf state secret: ", JSON.stringify(secretData));
    this.zarfStateSecret = secretData;

    return secretData;
  }

  async getZarfPrivateRegistrySecret(): Promise<any> {
    const secretData = await this.k8sApi.getSecretValues(
      this.privateRegistrySecretName,
      this.privateRegistrySecretNamespace,
      this.privateRegistrySecretKeys
    );
    Log.info("Private registry secret: ", JSON.stringify(secretData,undefined,2));
    this.privateRegistrySecret = secretData;

    return secretData;
  }


  // async buildAuthserviceSecret() {
  //   const missionSecrets = await this.k8sApi.getSecretsByPattern(
  //     "mission-",
  //     "authservice"
  //   );
  //   if (missionSecrets.length == 0) {
  //     return;
  //   }
  //   const authserviceConfig = await this.getAuthServiceSecret();

  //   authserviceConfig.chains = missionSecrets.map(secret => {
  //     const name = this.decodeBase64(secret, "name");
  //     const domain = this.decodeBase64(secret, "domain");
  //     const id = this.decodeBase64(secret, "id");
  //     return AuthserviceConfig.createSingleChain({
  //       id,
  //       name,
  //       hostname: `${name}.${domain}`,
  //       redirect_uri: this.decodeBase64(secret, "redirect_uri"),
  //       secret: this.decodeBase64(secret, "secret"),
  //     });
  //   });

  //   await this.k8sApi.createOrUpdateSecret(
  //     this.authServiceNamespace,
  //     this.authServiceSecretName,
  //     { [this.authServiceConfigFileName]: JSON.stringify(authserviceConfig) }
  //   );
  // }
}

// export class PrivateRegistrySecret {
//   chains: FilterChain[];
//   listen_address: string;
//   listen_port: number;
//   log_level: string;
//   threads: number;
//   trigger_rules?: TriggerRule[];
//   default_oidc_config?: OIDCConfig;
//   allow_unmatched_requests?: boolean;

//   constructor(json: any) {
//     this.chains = json.chains.map((chain: any) => new FilterChain(chain));
//     this.listen_address = json.listen_address;
//     this.listen_port = json.listen_port;
//     this.log_level = json.log_level;
//     this.threads = json.threads;

//     if (json.trigger_rules !== undefined) {
//       this.trigger_rules = json.trigger_rules.map(
//         (rule: any) => new TriggerRule(rule)
//       );
//     }

//     if (json.default_oidc_config !== undefined) {
//       this.default_oidc_config = new OIDCConfig(json.default_oidc_config);
//     }

//     if (json.allow_unmatched_requests !== undefined) {
//       this.allow_unmatched_requests = json.allow_unmatched_requests;
//     }
//   }

//   static createSingleChain(input: ChainInput): FilterChain {
//     const oidcConfig = new OIDCConfig({
//       callback_uri: input.redirect_uri,
//       client_id: input.id,
//       client_secret: input.secret,
//       cookie_name_prefix: input.name,
//     });

//     const filter = new Filter({
//       oidc_override: oidcConfig,
//     });

//     const matchMe = new Match({
//       header: ":authority",
//       equality: input.hostname,
//     });

//     return new FilterChain({
//       name: input.name,
//       match: matchMe,
//       filters: [filter],
//     });
//   }

//   toObject(): Record<string, any> {
//     return {
//       chains: this.chains.map(chain => chain.toObject()),
//       listen_address: this.listen_address,
//       listen_port: this.listen_port,
//       log_level: this.log_level,
//       threads: this.threads,
//       trigger_rules: this.trigger_rules.map(rule => rule.toObject()),
//       default_oidc_config: this.default_oidc_config?.toObject(),
//       allow_unmatched_requests: this.allow_unmatched_requests,
//     };
//   }
// }
