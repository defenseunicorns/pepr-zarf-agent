import { IInitSecret } from "./api-types";
import {
    Log
} from "pepr";

export function InitSecretsReady(_initSecrets: IInitSecret): boolean {
    let found: boolean = false;
    try {
        Log.info("Checking init secrets");
        if (!_initSecrets.privateRegistrySecret || !_initSecrets.zarfStateSecret) {
            Log.info("Init secrets not initialized");
            found = false;
        } else {
            Log.info("Init secrets initialized");
            found = true
        }
    } catch {
        Log.info("Init secrets not initialized");
        return found
    }

    return found;
}
