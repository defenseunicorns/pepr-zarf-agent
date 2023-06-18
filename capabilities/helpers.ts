let _initSecrets: IInitSecret;

function CheckInitSecrets(): boolean {
    let found: boolean = false;
    try {
      console.log("Checking init secrets");
      if (!_initSecrets || !_initSecrets.privateRegistrySecret || !_initSecrets.zarfStateSecret) {
        console.log("Init secrets not initialized");
        found = false;
      } else {
        console.log("Init secrets initialized");
        found=true
      }
    } catch {
      console.log("Init secrets not initialized");
      return found
    }
  
    return found;
  }

class CreateInitSecret<T> {
    initSecrets: T;
    constructor(init:T) {
        this.initSecrets = init
    }
}
console.log("Should return false", CheckInitSecrets())

interface IInitSecret {
    privateRegistrySecret: any;
    zarfStateSecret: any;
}

let s: IInitSecret = {
    privateRegistrySecret: "a",
    zarfStateSecret: "d"
};
_initSecrets = new CreateInitSecret<IInitSecret>(s).initSecrets

console.log("Should return true", CheckInitSecrets())