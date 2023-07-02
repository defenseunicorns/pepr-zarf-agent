# Makefile for building the Pepr Zarf Agent and the Transformer Service

SHELL=bash
DOCKER_USERNAME=cmwylie19
TAG=0.0.1

build/transformer-service:
	@echo "Building Transformer Service"
	@GOARCH=amd64 GOOS=linux go build -v -o transformer . 
	@mv transformer build/
	@docker build -t $(DOCKER_USERNAME)/transformer:$(TAG) build 
	@docker push $(DOCKER_USERNAME)/transformer:$(TAG)