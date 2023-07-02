# Transformer

- [Prereqs](#prereqs)
- [Compile Proto](#compile-proto)
- [Curl Endpoints Local](#curl-endpoints-local)
- [Curl Endpoints Kubernetes](#curl-endpoints-kubernetes)
- [Build](#build)

## Prereqs

- Protobuf
- gRPC Curl
- ts-protoc-gen
- (buf)[https://buf.build/docs/installation/]

Brew 
```bash
brew install protobuf
npm install ts-protoc-gen
brew install bufbuild/buf/buf
npm install -g ts-proto
```

Ubuntu/Debian
```bash
sudo apt install protobuf-compiler
npm install ts-protoc-gen
```

CentOS/Fedora
```bash
sudo yum install protobuf-compiler
npm install ts-protoc-gen
npm install -g ts-proto
```

## Compile Proto

```bash
protoc api/v1/image/image.proto --go_out=.  --go-grpc_out=. 

grpc_tools_node_protoc \
--plugin=protoc-gen-ts=../node_modules/.bin/protoc-gen-ts \
--ts_out=grpc_js:../capabilities/lib/images \
--js_out=import_style=commonjs:../capabilities/lib/images \
--grpc_out=grpc_js:../capabilities/lib/images \
-I ./api/v1/image/ \
./api/v1/image/image.proto

```

## Curl Endpoints Local

```bash
$ grpcurl -plaintext localhost:50051 list

grpc.reflection.v1alpha.ServerReflection
image.defenseunicorns.com.ImageTransform

$ grpcurl -plaintext localhost:50051 describe image.defenseunicorns.com.ImageTransform

image.defenseunicorns.com.ImageTransform is a service:
service ImageTransform {
  rpc ImageTransformHost ( .image.defenseunicorns.com.TransformRequest ) returns ( .image.defenseunicorns.com.TransformResponse );
  rpc ImageTransformHostWithoutChecksum ( .image.defenseunicorns.com.TransformRequest ) returns ( .image.defenseunicorns.com.TransformResponse );
}

$ grpcurl -plaintext -d '{"targetHost":"gitlab.com/project","srcReference":"nginx"}' localhost:50051 image.defenseunicorns.com.ImageTransform/ImageTransformHost   

{
  "transformedImage": "gitlab.com/project/library/nginx:latest-zarf-3793515731"
}

$ grpcurl -plaintext -d '{"targetHost":"gitlab.com/project","srcReference":"nginx"}' localhost:50051 image.defenseunicorns.com.ImageTransform/ImageTransformHostWithoutChecksum

{
  "transformedImage": "gitlab.com/project/library/nginx:latest"
}
```

## Curl Endpoints Kubernetes

Deploy in dev mode

```bash
make deploy/dev

# or 
kubectl create -k transformer/deploy/dev
```

Create the debugger pod

```bash
kubectl run debugger --image=cmwylie19/grpcurl-debugger:0.0.1
kubectl wait --for=condition=Ready Pod debugger --timeout=60s
```

List Services
```bash
kubectl exec -it debugger -- grpcurl -plaintext transformer.pepr-system.svc.cluster.local:50051 list

# grpc.reflection.v1alpha.ServerReflection
# image.defenseunicorns.com.ImageTransform
``

Describe Service
```bash
kubectl exec -it debugger -- grpcurl -plaintext transformer.pepr-system.svc.cluster.local:50051 describe image.defenseunicorns.com.ImageTransform

# image.defenseunicorns.com.ImageTransform is a service:
# service ImageTransform {
#   rpc ImageTransformHost ( .image.defenseunicorns.com.TransformRequest ) returns ( .image.defenseunicorns.com.TransformResponse );
#   rpc ImageTransformHostWithoutChecksum ( .image.defenseunicorns.com.TransformRequest ) returns ( .image.defenseunicorns.com.TransformResponse );
# }
```

## Curl Endpoints Kubernetes

ImageTransformHost  
```bash
kubectl exec -it debugger -- grpcurl -plaintext -d '{"targetHost":"gitlab.com/project","srcReference":"nginx"}' transformer.pepr-system.svc.cluster.local:50051 image.defenseunicorns.com.ImageTransform/ImageTransformHost

# {
#   "transformedImage": "gitlab.com/project/library/nginx:latest-zarf-3793515731"
# }
```

ImageTransformHostWithoutChecksum
```bash
kubectl exec -it debugger -- grpcurl -plaintext -d '{"targetHost":"gitlab.com/project","srcReference":"nginx"}' transformer.pepr-system.svc.cluster.local:50051 image.defenseunicorns.com.ImageTransform/ImageTransformHostWithoutChecksum

# {
#   "transformedImage": "gitlab.com/project/library/nginx:latest"
# }
```

## Build

```bash
make build
```
