# Makefile for building the Pepr Zarf Agent and the Transformer Service

SHELL=bash
DOCKER_USERNAME=cmwylie19
TAG=0.0.1

include transformer/Makefile

.PHONY: build/pepr-zarf-agent
build/pepr-zarf-agent:
	@echo "Building Pepr Zarf Agent"
	@echo "Create kind cluster"
	@kind create cluster --name=pepr-zarf-agent
	@pepr build

.PHONY: build/transformer-service
build/transformer-service: 
	@cd transformer
	@$(MAKE) -C transformer build/transformer-service

.PHONY: build/debugger
build/debugger:
	@echo "Building Debugger"
	@docker build . -t $(DOCKER_USERNAME)/grpcurl-debugger:$(TAG) -f grpcurl-debugger/Dockerfile
	@docker push $(DOCKER_USERNAME)/grpcurl-debugger:$(TAG)

.PHONY: deploy/dev
deploy/dev:
	@echo "Deploying to Dev"
	@kubectl create -k transformer/k8s/overlays/dev 
	@sleep 20
	@kubectl wait --for=condition=Ready pod -l app=transformer --timeout=60s -n pepr-system
	@kubectl wait --for=condition=Ready pod -l run=debugger --timeout=60s -n pepr-system

.PHONY: check/server
check/server:
	@echo "Checking Server"
	@kubectl run debugger --image=cmwylie19/grpcurl-debugger:0.0.1
	@echo "Waiting for server to be ready"
	@kubectl wait --for=condition=Ready Pod debugger --timeout=60s
	@echo "List gRPC Services"
	@kubectl exec -it debugger -- grpcurl -plaintext transformer.pepr-system.svc.cluster.local:50051 list
	@echo "Describe gRPC Service"
	@kubectl exec -it debugger -- grpcurl -plaintext transformer.pepr-system.svc.cluster.local:50051 describe image.defenseunicorns.com.ImageTransform
	@echo "Invoke gRPC Service -- ImageTransformHost"
	@kubectl exec -it debugger -- grpcurl -plaintext -d '{"targetHost":"gitlab.com/project","srcReference":"nginx"}' transformer.pepr-system.svc.cluster.local:50051 image.defenseunicorns.com.ImageTransform/ImageTransformHost
	@echo "Invoke gRPC Service -- ImageTransformHostWithoutChecksum"
	@kubectl exec -it debugger -- grpcurl -plaintext -d '{"targetHost":"gitlab.com/project","srcReference":"nginx"}' transformer.pepr-system.svc.cluster.local:50051 image.defenseunicorns.com.ImageTransform/ImageTransformHostWithoutChecksum
	@echo "Delete debugger"
	@kubectl delete po debugger --force --grace-period=0

.PHONY: clean
clean:
	@echo "Removing cluster"
	@kind delete cluster --name=pepr-zarf-agent


all: build/pepr-zarf-agent build/transformer-service build/debugger
