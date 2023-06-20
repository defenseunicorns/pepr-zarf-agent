#!/bin/bash

kind delete clusters --all;
docker image prune -a -f;
kind create cluster
pepr build;kubectl create -f dist;
sleep 35;
kubectl wait --for=condition=Ready pod -l app -n pepr-system --timeout=180s;
kubectl logs deploy/$(kubectl get deployments --output=jsonpath='{.items[0].metadata.name}' -n pepr-system) -f -n pepr-system