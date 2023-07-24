import { AppsV1Api, CoreV1Api } from "@kubernetes/client-node";
export declare class K8sAPI {
    k8sApi: CoreV1Api;
    k8sAppsV1Api: AppsV1Api;
    constructor();
    addImagePullSecretToPod(name: string, namespace: string, secretName: string): Promise<void>;
    getSecretValues(name: string, namespace: string, keys: string[]): Promise<{
        [key: string]: string;
    }>;
    createOrUpdateSecret(name: string, namespace: string, secretData: Record<string, string>): Promise<void>;
}
//# sourceMappingURL=kubernetes-api.d.ts.map