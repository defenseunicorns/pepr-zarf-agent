# Makefile for building the Pepr Zarf Agent and the Transformer Service

SHELL=bash
DOCKER_USERNAME=cmwylie19
TAG=0.0.1

include wasm-transform/Makefile

.PHONY: build/wasm-transform
build/wasm-transform: 
	@cd wasm-transform
	@$(MAKE) -C wasm-transform build/wasm-transformer

