import { IInitSecret } from "./api-types";
import { PeprRequest, a } from "pepr";
export declare function UpdateContainerImages(pod: PeprRequest<a.Pod>, address: string): void;
export declare function GetCRCHash(data: string): number;
export declare function checkPattern(str: string, pattern: RegExp): boolean;
export declare function ParseAnyReference(imageString: string): {
    host: string;
    path: string;
    tag: string;
    digest: string;
};
export declare function ImageTransformHost(targetHost: string, srcReference: string): string;
export declare function ImageTransformHostWithoutChecksum(targetHost: string, srcReference: string): string;
export declare function InitSecretsReady(_initSecrets: IInitSecret): boolean;
export declare function argoRepoSecretDataDecoder(encodedString: string): string;
export declare function argoSecretLabels(req: PeprRequest<a.Secret>): boolean;
//# sourceMappingURL=helpers.d.ts.map