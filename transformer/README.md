# Transformer

- [Prereqs](#prereqs)
- [Compile Proto](#compile-proto)
- [Curl Endpoints](#curl-endpoints)
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
protoc api/v1/image/image.proto --go_out=.  --go-grpc_out=. --ts_out=ts_generated

grpc_tools_node_protoc \
--plugin=protoc-gen-ts=../node_modules/.bin/protoc-gen-ts \
--ts_out=grpc_js:../capabilities/lib/images \
--grpc_out=grpc_js:../capabilities/lib/images \
-I .//api/v1/image/ \
./api/v1/image/image.proto

```

## Curl Endpoints

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


## Build

```bash
GOARCH=amd64 GOOS=linux go build -o transformer . 
mv transformer ./build/

docker build -t cmwylie19/transformer:0.0.1 build/
docker push cmwylie19/transformer:0.0.1
```
