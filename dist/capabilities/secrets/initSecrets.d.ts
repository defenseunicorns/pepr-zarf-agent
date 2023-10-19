import { K8sAPI } from "../kubernetes-api";
import { ZarfState, AuthData } from "../api-types";
export declare class InitSecrets {
    k8sApi: K8sAPI;
    zarfStateSecretName: string;
    zarfStateSecretNamespace: string;
    zarfStateSecretKeys: string[];
    zarfStateSecretData: Record<string, string>;
    privateRegistrySecretName: string;
    privateRegistrySecretNamespace: string;
    privateRegistrySecretKeys: string[];
    privateRegistrySecretData: Record<string, string>;
    zarfStateSecret: ZarfState;
    privateRegistrySecret: AuthData;
    constructor(k8sApi: K8sAPI);
    getZarfStateSecret(): Promise<ZarfState>;
    getZarfPrivateRegistrySecret(): Promise<AuthData>;
}
//# sourceMappingURL=initSecrets.d.ts.map