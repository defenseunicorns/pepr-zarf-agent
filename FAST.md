Argo
```bash
build/zarf-mac-apple package remove argocd  --confirm; k delete apps,secrets -n argocd --all --force ;build/zarf-mac-apple package deploy zarf-package-argocd-arm64.tar.zst
```

Flux

```bash
build/zarf-mac-apple package remove podinfo-flux --confirm; build/zarf-mac-apple package deploy zarf-package-podinfo-flux-arm64.tar.zst --confirm
```

Pepr 

```bash
cd wasm-transform;make;cd ..;npx pepr dev -l debug --confirm
```

Cluster

```bash
k3d cluster delete; k3d cluster create; CLI_VERSION=v0.28.4 make build-cli-mac-apple; build/zarf-mac-apple package create;build/zarf-mac-apple package deploy zarf-init-arm64-v0.28.4.tar.zst;
```
