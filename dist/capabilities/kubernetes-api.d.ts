import { AppsV1Api, CoreV1Api } from "@kubernetes/client-node";
export declare class K8sAPI {
    k8sApi: CoreV1Api;
    k8sAppsV1Api: AppsV1Api;
    constructor();
    getSecretValues(name: string, namespace: string, keys: string[]): Promise<{
        [key: string]: string;
    }>;
}
//# sourceMappingURL=kubernetes-api.d.ts.map