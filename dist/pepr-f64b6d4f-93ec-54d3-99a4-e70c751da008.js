var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// pepr.ts
var import_pepr6 = require("pepr");

// package.json
var package_default = {
  name: "pepr-zarf-agent",
  version: "0.0.1",
  description: "",
  keywords: [
    "pepr",
    "k8s",
    "policy-engine",
    "pepr-module",
    "security"
  ],
  pepr: {
    name: "pepr-zarf-agent",
    uuid: "f64b6d4f-93ec-54d3-99a4-e70c751da008",
    onError: "audit",
    alwaysIgnore: {
      namespaces: [],
      labels: []
    }
  },
  scripts: {
    "k3d-setup": "k3d cluster delete pepr-dev && k3d cluster create pepr-dev --k3s-arg '--debug@server:0'",
    start: "pepr dev"
  },
  dependencies: {
    "@grpc/grpc-js": "^1.8.17",
    pepr: "0.7.0",
    "ts-proto": "^1.150.1"
  },
  devDependencies: {
    "@types/jest": "^29.5.2",
    grpc_tools_node_protoc_ts: "^5.3.3",
    "grpc-tools": "^1.12.4",
    jest: "^29.5.0",
    "ts-jest": "^29.1.0",
    "ts-protoc-gen": "^0.15.0",
    typescript: "5.0.4"
  }
};

// capabilities/wasm_exec.js
(() => {
  if (typeof globalThis.crypto === "undefined") {
    globalThis.crypto = {
      getRandomValues: (array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
      }
    };
  }
  const enosys = /* @__PURE__ */ __name(() => {
    const err = new Error("not implemented");
    err.code = "ENOSYS";
    return err;
  }, "enosys");
  if (!globalThis.fs) {
    let outputBuf = "";
    globalThis.fs = {
      constants: { O_WRONLY: -1, O_RDWR: -1, O_CREAT: -1, O_TRUNC: -1, O_APPEND: -1, O_EXCL: -1 },
      // unused
      writeSync(fd, buf) {
        outputBuf += decoder.decode(buf);
        const nl = outputBuf.lastIndexOf("\n");
        if (nl != -1) {
          console.log(outputBuf.substring(0, nl));
          outputBuf = outputBuf.substring(nl + 1);
        }
        return buf.length;
      },
      write(fd, buf, offset, length, position, callback) {
        if (offset !== 0 || length !== buf.length || position !== null) {
          callback(enosys());
          return;
        }
        const n = this.writeSync(fd, buf);
        callback(null, n);
      },
      chmod(path, mode, callback) {
        callback(enosys());
      },
      chown(path, uid, gid, callback) {
        callback(enosys());
      },
      close(fd, callback) {
        callback(enosys());
      },
      fchmod(fd, mode, callback) {
        callback(enosys());
      },
      fchown(fd, uid, gid, callback) {
        callback(enosys());
      },
      fstat(fd, callback) {
        callback(enosys());
      },
      fsync(fd, callback) {
        callback(null);
      },
      ftruncate(fd, length, callback) {
        callback(enosys());
      },
      lchown(path, uid, gid, callback) {
        callback(enosys());
      },
      link(path, link, callback) {
        callback(enosys());
      },
      lstat(path, callback) {
        callback(enosys());
      },
      mkdir(path, perm, callback) {
        callback(enosys());
      },
      open(path, flags, mode, callback) {
        callback(enosys());
      },
      read(fd, buffer, offset, length, position, callback) {
        callback(enosys());
      },
      readdir(path, callback) {
        callback(enosys());
      },
      readlink(path, callback) {
        callback(enosys());
      },
      rename(from, to, callback) {
        callback(enosys());
      },
      rmdir(path, callback) {
        callback(enosys());
      },
      stat(path, callback) {
        callback(enosys());
      },
      symlink(path, link, callback) {
        callback(enosys());
      },
      truncate(path, length, callback) {
        callback(enosys());
      },
      unlink(path, callback) {
        callback(enosys());
      },
      utimes(path, atime, mtime, callback) {
        callback(enosys());
      }
    };
  }
  if (!globalThis.process) {
    globalThis.process = {
      getuid() {
        return -1;
      },
      getgid() {
        return -1;
      },
      geteuid() {
        return -1;
      },
      getegid() {
        return -1;
      },
      getgroups() {
        throw enosys();
      },
      pid: -1,
      ppid: -1,
      umask() {
        throw enosys();
      },
      cwd() {
        throw enosys();
      },
      chdir() {
        throw enosys();
      }
    };
  }
  if (!globalThis.crypto) {
    throw new Error("globalThis.crypto is not available, polyfill required (crypto.getRandomValues only)");
  }
  if (!globalThis.performance) {
    throw new Error("globalThis.performance is not available, polyfill required (performance.now only)");
  }
  if (!globalThis.TextEncoder) {
    throw new Error("globalThis.TextEncoder is not available, polyfill required");
  }
  if (!globalThis.TextDecoder) {
    throw new Error("globalThis.TextDecoder is not available, polyfill required");
  }
  const encoder = new TextEncoder("utf-8");
  const decoder = new TextDecoder("utf-8");
  globalThis.Go = class {
    constructor() {
      this.argv = ["js"];
      this.env = {};
      this.exit = (code) => {
        if (code !== 0) {
          console.warn("exit code:", code);
        }
      };
      this._exitPromise = new Promise((resolve) => {
        this._resolveExitPromise = resolve;
      });
      this._pendingEvent = null;
      this._scheduledTimeouts = /* @__PURE__ */ new Map();
      this._nextCallbackTimeoutID = 1;
      const setInt64 = /* @__PURE__ */ __name((addr, v) => {
        this.mem.setUint32(addr + 0, v, true);
        this.mem.setUint32(addr + 4, Math.floor(v / 4294967296), true);
      }, "setInt64");
      const getInt64 = /* @__PURE__ */ __name((addr) => {
        const low = this.mem.getUint32(addr + 0, true);
        const high = this.mem.getInt32(addr + 4, true);
        return low + high * 4294967296;
      }, "getInt64");
      const loadValue = /* @__PURE__ */ __name((addr) => {
        const f = this.mem.getFloat64(addr, true);
        if (f === 0) {
          return void 0;
        }
        if (!isNaN(f)) {
          return f;
        }
        const id = this.mem.getUint32(addr, true);
        return this._values[id];
      }, "loadValue");
      const storeValue = /* @__PURE__ */ __name((addr, v) => {
        const nanHead = 2146959360;
        if (typeof v === "number" && v !== 0) {
          if (isNaN(v)) {
            this.mem.setUint32(addr + 4, nanHead, true);
            this.mem.setUint32(addr, 0, true);
            return;
          }
          this.mem.setFloat64(addr, v, true);
          return;
        }
        if (v === void 0) {
          this.mem.setFloat64(addr, 0, true);
          return;
        }
        let id = this._ids.get(v);
        if (id === void 0) {
          id = this._idPool.pop();
          if (id === void 0) {
            id = this._values.length;
          }
          this._values[id] = v;
          this._goRefCounts[id] = 0;
          this._ids.set(v, id);
        }
        this._goRefCounts[id]++;
        let typeFlag = 0;
        switch (typeof v) {
          case "object":
            if (v !== null) {
              typeFlag = 1;
            }
            break;
          case "string":
            typeFlag = 2;
            break;
          case "symbol":
            typeFlag = 3;
            break;
          case "function":
            typeFlag = 4;
            break;
        }
        this.mem.setUint32(addr + 4, nanHead | typeFlag, true);
        this.mem.setUint32(addr, id, true);
      }, "storeValue");
      const loadSlice = /* @__PURE__ */ __name((addr) => {
        const array = getInt64(addr + 0);
        const len = getInt64(addr + 8);
        return new Uint8Array(this._inst.exports.mem.buffer, array, len);
      }, "loadSlice");
      const loadSliceOfValues = /* @__PURE__ */ __name((addr) => {
        const array = getInt64(addr + 0);
        const len = getInt64(addr + 8);
        const a3 = new Array(len);
        for (let i = 0; i < len; i++) {
          a3[i] = loadValue(array + i * 8);
        }
        return a3;
      }, "loadSliceOfValues");
      const loadString = /* @__PURE__ */ __name((addr) => {
        const saddr = getInt64(addr + 0);
        const len = getInt64(addr + 8);
        return decoder.decode(new DataView(this._inst.exports.mem.buffer, saddr, len));
      }, "loadString");
      const timeOrigin = Date.now() - performance.now();
      this.importObject = {
        go: {
          // Go's SP does not change as long as no Go code is running. Some operations (e.g. calls, getters and setters)
          // may synchronously trigger a Go event handler. This makes Go code get executed in the middle of the imported
          // function. A goroutine can switch to a new stack if the current stack is too small (see morestack function).
          // This changes the SP, thus we have to update the SP used by the imported function.
          // func wasmExit(code int32)
          "runtime.wasmExit": (sp) => {
            sp >>>= 0;
            const code = this.mem.getInt32(sp + 8, true);
            this.exited = true;
            delete this._inst;
            delete this._values;
            delete this._goRefCounts;
            delete this._ids;
            delete this._idPool;
            this.exit(code);
          },
          // func wasmWrite(fd uintptr, p unsafe.Pointer, n int32)
          "runtime.wasmWrite": (sp) => {
            sp >>>= 0;
            const fd = getInt64(sp + 8);
            const p = getInt64(sp + 16);
            const n = this.mem.getInt32(sp + 24, true);
            fs.writeSync(fd, new Uint8Array(this._inst.exports.mem.buffer, p, n));
          },
          // func resetMemoryDataView()
          "runtime.resetMemoryDataView": (sp) => {
            sp >>>= 0;
            this.mem = new DataView(this._inst.exports.mem.buffer);
          },
          // func nanotime1() int64
          "runtime.nanotime1": (sp) => {
            sp >>>= 0;
            setInt64(sp + 8, (timeOrigin + performance.now()) * 1e6);
          },
          // func walltime() (sec int64, nsec int32)
          "runtime.walltime": (sp) => {
            sp >>>= 0;
            const msec = (/* @__PURE__ */ new Date()).getTime();
            setInt64(sp + 8, msec / 1e3);
            this.mem.setInt32(sp + 16, msec % 1e3 * 1e6, true);
          },
          // func scheduleTimeoutEvent(delay int64) int32
          "runtime.scheduleTimeoutEvent": (sp) => {
            sp >>>= 0;
            const id = this._nextCallbackTimeoutID;
            this._nextCallbackTimeoutID++;
            this._scheduledTimeouts.set(id, setTimeout(
              () => {
                this._resume();
                while (this._scheduledTimeouts.has(id)) {
                  console.warn("scheduleTimeoutEvent: missed timeout event");
                  this._resume();
                }
              },
              getInt64(sp + 8) + 1
              // setTimeout has been seen to fire up to 1 millisecond early
            ));
            this.mem.setInt32(sp + 16, id, true);
          },
          // func clearTimeoutEvent(id int32)
          "runtime.clearTimeoutEvent": (sp) => {
            sp >>>= 0;
            const id = this.mem.getInt32(sp + 8, true);
            clearTimeout(this._scheduledTimeouts.get(id));
            this._scheduledTimeouts.delete(id);
          },
          // func getRandomData(r []byte)
          "runtime.getRandomData": (sp) => {
            sp >>>= 0;
            crypto.getRandomValues(loadSlice(sp + 8));
          },
          // func finalizeRef(v ref)
          "syscall/js.finalizeRef": (sp) => {
            sp >>>= 0;
            const id = this.mem.getUint32(sp + 8, true);
            this._goRefCounts[id]--;
            if (this._goRefCounts[id] === 0) {
              const v = this._values[id];
              this._values[id] = null;
              this._ids.delete(v);
              this._idPool.push(id);
            }
          },
          // func stringVal(value string) ref
          "syscall/js.stringVal": (sp) => {
            sp >>>= 0;
            storeValue(sp + 24, loadString(sp + 8));
          },
          // func valueGet(v ref, p string) ref
          "syscall/js.valueGet": (sp) => {
            sp >>>= 0;
            const result = Reflect.get(loadValue(sp + 8), loadString(sp + 16));
            sp = this._inst.exports.getsp() >>> 0;
            storeValue(sp + 32, result);
          },
          // func valueSet(v ref, p string, x ref)
          "syscall/js.valueSet": (sp) => {
            sp >>>= 0;
            Reflect.set(loadValue(sp + 8), loadString(sp + 16), loadValue(sp + 32));
          },
          // func valueDelete(v ref, p string)
          "syscall/js.valueDelete": (sp) => {
            sp >>>= 0;
            Reflect.deleteProperty(loadValue(sp + 8), loadString(sp + 16));
          },
          // func valueIndex(v ref, i int) ref
          "syscall/js.valueIndex": (sp) => {
            sp >>>= 0;
            storeValue(sp + 24, Reflect.get(loadValue(sp + 8), getInt64(sp + 16)));
          },
          // valueSetIndex(v ref, i int, x ref)
          "syscall/js.valueSetIndex": (sp) => {
            sp >>>= 0;
            Reflect.set(loadValue(sp + 8), getInt64(sp + 16), loadValue(sp + 24));
          },
          // func valueCall(v ref, m string, args []ref) (ref, bool)
          "syscall/js.valueCall": (sp) => {
            sp >>>= 0;
            try {
              const v = loadValue(sp + 8);
              const m = Reflect.get(v, loadString(sp + 16));
              const args = loadSliceOfValues(sp + 32);
              const result = Reflect.apply(m, v, args);
              sp = this._inst.exports.getsp() >>> 0;
              storeValue(sp + 56, result);
              this.mem.setUint8(sp + 64, 1);
            } catch (err) {
              sp = this._inst.exports.getsp() >>> 0;
              storeValue(sp + 56, err);
              this.mem.setUint8(sp + 64, 0);
            }
          },
          // func valueInvoke(v ref, args []ref) (ref, bool)
          "syscall/js.valueInvoke": (sp) => {
            sp >>>= 0;
            try {
              const v = loadValue(sp + 8);
              const args = loadSliceOfValues(sp + 16);
              const result = Reflect.apply(v, void 0, args);
              sp = this._inst.exports.getsp() >>> 0;
              storeValue(sp + 40, result);
              this.mem.setUint8(sp + 48, 1);
            } catch (err) {
              sp = this._inst.exports.getsp() >>> 0;
              storeValue(sp + 40, err);
              this.mem.setUint8(sp + 48, 0);
            }
          },
          // func valueNew(v ref, args []ref) (ref, bool)
          "syscall/js.valueNew": (sp) => {
            sp >>>= 0;
            try {
              const v = loadValue(sp + 8);
              const args = loadSliceOfValues(sp + 16);
              const result = Reflect.construct(v, args);
              sp = this._inst.exports.getsp() >>> 0;
              storeValue(sp + 40, result);
              this.mem.setUint8(sp + 48, 1);
            } catch (err) {
              sp = this._inst.exports.getsp() >>> 0;
              storeValue(sp + 40, err);
              this.mem.setUint8(sp + 48, 0);
            }
          },
          // func valueLength(v ref) int
          "syscall/js.valueLength": (sp) => {
            sp >>>= 0;
            setInt64(sp + 16, parseInt(loadValue(sp + 8).length));
          },
          // valuePrepareString(v ref) (ref, int)
          "syscall/js.valuePrepareString": (sp) => {
            sp >>>= 0;
            const str = encoder.encode(String(loadValue(sp + 8)));
            storeValue(sp + 16, str);
            setInt64(sp + 24, str.length);
          },
          // valueLoadString(v ref, b []byte)
          "syscall/js.valueLoadString": (sp) => {
            sp >>>= 0;
            const str = loadValue(sp + 8);
            loadSlice(sp + 16).set(str);
          },
          // func valueInstanceOf(v ref, t ref) bool
          "syscall/js.valueInstanceOf": (sp) => {
            sp >>>= 0;
            this.mem.setUint8(sp + 24, loadValue(sp + 8) instanceof loadValue(sp + 16) ? 1 : 0);
          },
          // func copyBytesToGo(dst []byte, src ref) (int, bool)
          "syscall/js.copyBytesToGo": (sp) => {
            sp >>>= 0;
            const dst = loadSlice(sp + 8);
            const src = loadValue(sp + 32);
            if (!(src instanceof Uint8Array || src instanceof Uint8ClampedArray)) {
              this.mem.setUint8(sp + 48, 0);
              return;
            }
            const toCopy = src.subarray(0, dst.length);
            dst.set(toCopy);
            setInt64(sp + 40, toCopy.length);
            this.mem.setUint8(sp + 48, 1);
          },
          // func copyBytesToJS(dst ref, src []byte) (int, bool)
          "syscall/js.copyBytesToJS": (sp) => {
            sp >>>= 0;
            const dst = loadValue(sp + 8);
            const src = loadSlice(sp + 16);
            if (!(dst instanceof Uint8Array || dst instanceof Uint8ClampedArray)) {
              this.mem.setUint8(sp + 48, 0);
              return;
            }
            const toCopy = src.subarray(0, dst.length);
            dst.set(toCopy);
            setInt64(sp + 40, toCopy.length);
            this.mem.setUint8(sp + 48, 1);
          },
          "debug": (value) => {
            console.log(value);
          }
        }
      };
    }
    async run(instance) {
      if (!(instance instanceof WebAssembly.Instance)) {
        throw new Error("Go.run: WebAssembly.Instance expected");
      }
      this._inst = instance;
      this.mem = new DataView(this._inst.exports.mem.buffer);
      this._values = [
        // JS values that Go currently has references to, indexed by reference id
        NaN,
        0,
        null,
        true,
        false,
        globalThis,
        this
      ];
      this._goRefCounts = new Array(this._values.length).fill(Infinity);
      this._ids = /* @__PURE__ */ new Map([
        // mapping from JS values to reference ids
        [0, 1],
        [null, 2],
        [true, 3],
        [false, 4],
        [globalThis, 5],
        [this, 6]
      ]);
      this._idPool = [];
      this.exited = false;
      let offset = 4096;
      const strPtr = /* @__PURE__ */ __name((str) => {
        const ptr = offset;
        const bytes = encoder.encode(str + "\0");
        new Uint8Array(this.mem.buffer, offset, bytes.length).set(bytes);
        offset += bytes.length;
        if (offset % 8 !== 0) {
          offset += 8 - offset % 8;
        }
        return ptr;
      }, "strPtr");
      const argc = this.argv.length;
      const argvPtrs = [];
      this.argv.forEach((arg) => {
        argvPtrs.push(strPtr(arg));
      });
      argvPtrs.push(0);
      const keys = Object.keys(this.env).sort();
      keys.forEach((key) => {
        argvPtrs.push(strPtr(`${key}=${this.env[key]}`));
      });
      argvPtrs.push(0);
      const argv = offset;
      argvPtrs.forEach((ptr) => {
        this.mem.setUint32(offset, ptr, true);
        this.mem.setUint32(offset + 4, 0, true);
        offset += 8;
      });
      const wasmMinDataAddr = 4096 + 8192;
      if (offset >= wasmMinDataAddr) {
        throw new Error("total length of command line and environment variables exceeds limit");
      }
      this._inst.exports.run(argc, argv);
      if (this.exited) {
        this._resolveExitPromise();
      }
      await this._exitPromise;
    }
    _resume() {
      if (this.exited) {
        throw new Error("Go program has already exited");
      }
      this._inst.exports.resume();
      if (this.exited) {
        this._resolveExitPromise();
      }
    }
    _makeFuncWrapper(id) {
      const go = this;
      return function() {
        const event = { id, this: this, args: arguments };
        go._pendingEvent = event;
        go._resume();
        return event.result;
      };
    }
  };
})();

// capabilities/zarf-agent.ts
var import_pepr5 = require("pepr");

// capabilities/kubernetes-api.ts
var import_pepr = require("pepr");
var import_client_node = require("@kubernetes/client-node");
var import_pepr2 = require("pepr");
var K8sAPI = class {
  k8sApi;
  k8sAppsV1Api;
  constructor() {
    const kc = new import_client_node.KubeConfig();
    kc.loadFromDefault();
    this.k8sApi = kc.makeApiClient(import_client_node.CoreV1Api);
    this.k8sAppsV1Api = kc.makeApiClient(import_client_node.AppsV1Api);
  }
  async addImagePullSecretToPod(name, namespace, secretName) {
    try {
      const patch = [
        {
          op: "replace",
          path: "/spec/imagePullSecrets",
          value: [
            {
              name: secretName
            }
          ]
        }
      ];
      this.k8sApi.patchNamespacedPod(
        name,
        namespace,
        patch,
        void 0,
        void 0,
        void 0,
        void 0,
        void 0,
        { headers: { "content-type": "application/json-patch+json" } }
      ).then(() => {
        import_pepr.Log.info("Pod patched successfully.");
      }).catch((error) => {
        import_pepr.Log.error("Error patching pod:", JSON.stringify(error.response.body));
      });
    } catch (err) {
      import_pepr.Log.error("Could not add imagePullSecret to pod", err);
    }
  }
  async getSecretValues(name, namespace, keys) {
    const response = await this.k8sApi.readNamespacedSecret(name, namespace);
    const secret = response.body.data;
    const secretValues = {};
    if (secret) {
      keys.forEach((key) => {
        if (secret[key]) {
          const decodedValue = Buffer.from(secret[key], "base64").toString(
            "utf-8"
          );
          secretValues[key] = decodedValue;
        } else {
          throw new Error(`Could not find key '${key}' in the secret ${name}`);
        }
      });
      return secretValues;
    }
    throw new Error(`Could not retrieve the secret ${name}`);
  }
  // async restartDeployment(name: string, namespace: string) {
  //   const patch = [
  //     {
  //       op: "add",
  //       path: "/spec/template/metadata/annotations/kubectl.kubernetes.io~1restartedAt",
  //       value: new Date().toISOString(),
  //     },
  //   ];
  //   await this.k8sAppsV1Api.patchNamespacedDeployment(
  //     name,
  //     namespace,
  //     patch,
  //     undefined,
  //     undefined,
  //     undefined,
  //     undefined,
  //     undefined,
  //     { headers: { "content-type": "application/json-patch+json" } }
  //   );
  // }
  // async getSecretsByPattern(pattern: string, namespace: string) {
  //   // Get all secrets in the namespace
  //   const secrets = await this.k8sApi.listNamespacedSecret(namespace);
  //   if (!secrets || !secrets.body || !secrets.body.items) {
  //     return [];
  //   }
  //   // Filter the secrets by the provided pattern
  //   const matchingSecrets = secrets.body.items.filter(
  //     secret =>
  //       secret.metadata &&
  //       secret.metadata.name &&
  //       secret.metadata.name.startsWith(pattern)
  //   );
  //   return matchingSecrets;
  // }
  async createOrUpdateSecret(name, namespace, secretData) {
    const secret = {
      apiVersion: "v1",
      kind: "Secret",
      metadata: {
        name,
        namespace
      },
      data: {}
    };
    for (const key in secretData) {
      secret.data[key] = Buffer.from(secretData[key]).toString("base64");
    }
    try {
      await this.k8sApi.readNamespacedSecret(name, namespace);
      await this.k8sApi.replaceNamespacedSecret(name, namespace, secret);
    } catch (e) {
      if (e.response && e.response.statusCode === import_pepr2.fetchStatus.NOT_FOUND) {
        await this.k8sApi.createNamespacedSecret(namespace, secret);
      } else {
        throw e;
      }
    }
  }
};
__name(K8sAPI, "K8sAPI");

// capabilities/secrets/initSecrets.ts
var import_pepr3 = require("pepr");
var InitSecrets = class {
  k8sApi;
  zarfStateSecretName = "zarf-state";
  zarfStateSecretNamespace = "zarf";
  zarfStateSecretKeys = ["state"];
  zarfStateSecretData;
  privateRegistrySecretName = "private-registry";
  privateRegistrySecretNamespace = "zarf";
  privateRegistrySecretKeys = [".dockerconfigjson"];
  privateRegistrySecretData;
  zarfStateSecret;
  privateRegistrySecret;
  constructor(k8sApi) {
    this.k8sApi = k8sApi;
  }
  decodeBase64(secret, key) {
    if (!secret.data) {
      throw new Error("Data is missing in secret");
    }
    if (!secret.data[key]) {
      throw new Error(`Key ${key} is missing in secret`);
    }
    return Buffer.from(secret.data[key], "base64").toString("utf-8");
  }
  // TODO type this
  async getZarfStateSecret() {
    const secretData = await this.k8sApi.getSecretValues(
      this.zarfStateSecretName,
      this.zarfStateSecretNamespace,
      this.zarfStateSecretKeys
    );
    const zarfState = JSON.parse(secretData.state);
    this.zarfStateSecret = zarfState;
    this.zarfStateSecretData = secretData;
    import_pepr3.Log.info("Zarf State Secret", JSON.stringify(zarfState, void 0, 2));
    return zarfState;
  }
  async getZarfPrivateRegistrySecret() {
    const secretData = await this.k8sApi.getSecretValues(
      this.privateRegistrySecretName,
      this.privateRegistrySecretNamespace,
      this.privateRegistrySecretKeys
    );
    const authData = JSON.parse(secretData[".dockerconfigjson"]);
    this.privateRegistrySecret = authData;
    this.privateRegistrySecretData = secretData;
    import_pepr3.Log.info("Private registry secret", JSON.stringify(authData, void 0, 2));
    return authData;
  }
  async createOrUpdateSecret(name, namespace, secretData) {
    await this.k8sApi.createOrUpdateSecret(name, namespace, secretData);
  }
  async patchPodImagePullSecret(name, namespace) {
    await this.k8sApi.addImagePullSecretToPod(
      name,
      namespace,
      this.privateRegistrySecretName
    );
    return;
  }
};
__name(InitSecrets, "InitSecrets");

// capabilities/transformer-api.ts
var import_pepr4 = require("pepr");
var import_fs = require("fs");
var TransformerAPI = class {
  go;
  instance;
  mutateArgoSecret(secret, request, targetHost, pushUsername) {
    return zarfTransform.argoSecretTransform(
      secret,
      request,
      targetHost,
      pushUsername
    );
  }
  mutateArgoApp(app, request, targetHost, pushUsername) {
    return zarfTransform.repoURLTransform(
      app,
      request,
      targetHost,
      pushUsername
    );
  }
  mutatePod(pod, request, imagePullSecretName, targetHost) {
    return zarfTransform.podTransform(
      pod,
      request,
      imagePullSecretName,
      targetHost
    );
  }
  // this create global zarfTransform object
  async instantiateWebAssembly() {
    return WebAssembly.instantiate(
      (0, import_fs.readFileSync)("capabilities/main.wasm"),
      this.go.importObject
    ).then((wasmModule) => {
      this.instance = this.go.run(wasmModule.instance);
    });
  }
  async run() {
    this.go = new globalThis.Go();
    try {
      await this.instantiateWebAssembly();
    } catch (err) {
      import_pepr4.Log.error("Error instantiating wasm module", err.toString());
      return;
    }
  }
  transformArgoSecret(secret, request, targetHost, pushUsername) {
    let transformedSecret;
    if (!this.instance) {
      throw new Error("WebAssembly module not loaded or initialized.");
    }
    try {
      transformedSecret = this.mutateArgoSecret(
        JSON.stringify(secret),
        JSON.stringify(request),
        targetHost,
        pushUsername
      );
    } catch (err) {
      import_pepr4.Log.error("Error calling repoURLTransform", err);
    }
    return transformedSecret;
  }
  transformArgoApp(app, request, targetHost, pushUsername) {
    let transformedApp;
    if (!this.instance) {
      throw new Error("WebAssembly module not loaded or initialized.");
    }
    try {
      transformedApp = this.mutateArgoApp(
        JSON.stringify(app),
        JSON.stringify(request),
        targetHost,
        pushUsername
      );
    } catch (err) {
      import_pepr4.Log.error("Error calling repoURLTransform", err);
    }
    return transformedApp;
  }
  transformPod(pod, request, imagePullSecretName, targetHost) {
    let transformedPod;
    if (!this.instance) {
      throw new Error("WebAssembly module not loaded or initialized.");
    }
    try {
      transformedPod = this.mutatePod(
        JSON.stringify(pod),
        JSON.stringify(request),
        imagePullSecretName,
        targetHost
      );
    } catch (err) {
      import_pepr4.Log.error("Error calling podTransform", err);
    }
    return transformedPod;
  }
};
__name(TransformerAPI, "TransformerAPI");

// capabilities/zarf-agent.ts
var ZarfAgent = new import_pepr5.Capability({
  name: "zarf-agent",
  description: "A mutating webhook for Zarf.",
  namespaces: []
  // all namespaces
});
var { When } = ZarfAgent;
var _initSecrets = new InitSecrets(new K8sAPI());
var _transformer = new TransformerAPI();
(async () => {
  import_pepr5.Log.SetLogLevel("debug");
  await _initSecrets.getZarfStateSecret();
  await _initSecrets.getZarfPrivateRegistrySecret();
  await _transformer.run();
})();
When(import_pepr5.a.Secret).IsCreated().WithLabel("argocd.argoproj.io/secret-type", "repository").Then((secret) => {
  try {
    secret.Raw.data.username = _initSecrets.zarfStateSecret.gitServer.pullUsername;
    secret.Raw.data.password = _initSecrets.zarfStateSecret.gitServer.pullPassword;
    secret.Raw = JSON.parse(
      _transformer.transformArgoSecret(
        secret.Raw,
        secret.Request,
        _initSecrets.zarfStateSecret.gitServer.address,
        _initSecrets.zarfStateSecret.gitServer.pushUsername
      )
    );
  } catch (err) {
    import_pepr5.Log.error("Error transforming argo secret", err);
  }
  console.log("secret", JSON.stringify(secret.Raw, void 0, 2));
});
When(import_pepr5.a.GenericKind, {
  group: "argoproj.io",
  version: "v1alpha1",
  kind: "Application"
  //(s) double check this
}).IsCreated().Then((app) => {
  let transformedApp;
  try {
    transformedApp = JSON.parse(
      _transformer.transformArgoApp(
        app.Raw,
        app.Request,
        _initSecrets.zarfStateSecret.gitServer.address,
        _initSecrets.zarfStateSecret.gitServer.pushUsername
      )
    );
  } catch (err) {
    import_pepr5.Log.error("Error transforming app", err);
  }
  transformedApp.spec.sources.map((argoApp, i) => {
    app.Raw.spec.sources[i].repoURL = argoApp.repoURL;
  });
  if (app.Raw.spec.source != void 0) {
    app.Raw.spec.source.repoURL = transformedApp.source.repoURL;
  } else {
    delete app.Raw.spec.source;
  }
  console.log("app", JSON.stringify(app.Raw, void 0, 2));
});
When(import_pepr5.a.Pod).IsCreatedOrUpdated().Then(async (pod) => {
  try {
    pod.Raw = JSON.parse(
      _transformer.transformPod(
        pod.Raw,
        pod.Request,
        _initSecrets.privateRegistrySecretName,
        _initSecrets.zarfStateSecret.registryInfo.address
      )
    );
  } catch (err) {
    import_pepr5.Log.error("Error transforming pod", err);
  }
  console.log("pod", JSON.stringify(pod, void 0, 2));
});

// pepr.ts
new import_pepr6.PeprModule(package_default, [
  // "HelloPepr" is a demo capability that is included with Pepr. Comment or delete the line below to remove it.
  // HelloPepr,
  ZarfAgent
  // HelloPepr,
  // Your additional capabilities go here
]);
//# sourceMappingURL=pepr-f64b6d4f-93ec-54d3-99a4-e70c751da008.js.map
