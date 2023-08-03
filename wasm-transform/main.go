package main

import (
	"encoding/json"
	"fmt"
	"log"
	"syscall/js"

	// appv1 "github.com/argoproj/argo-cd/v2/pkg/apis/application/v1alpha1"
	corev1 "k8s.io/api/core/v1"

	// appv1 "github.com/argoproj/argo-cd/v2/pkg/apis/application/v1alpha1"
	"github.com/defenseunicorns/zarf/src/pkg/transform"
)

const AgentErrImageSwap = "Unable to swap the host for (%s)"
const RepoURLHostSwap = "Unable to swap repoURL for (%s)"
const ArgoSecretSwap = "Unable to swap argo secret (%s)"

type Source struct {
	RepoURL string `json:"repoURL"`
}

type Spec struct {
	Source  Source   `json:"source"`
	Sources []Source `json:"sources"`
}
type ArgoApplication struct {
	Spec Spec `json:"spec"`
}
type ArgoSecretData struct {
	Url      string `json:"url"`
	Password string `json:"password"`
	Username string `json:"username"`
	Name     string `json:"name"`
}
type CustomSecret struct {
	ApiVersion string            `json:"apiVersion"`
	Kind       string            `json:"kind"`
	Metadata   SecretMetadata    `json:"metadata"`
	Immutable  *bool             `json:"immutable,omitempty"`
	Data       ArgoSecretData    `json:"data"`
	StringData map[string]string `json:"stringData,omitempty"`
	Type       string            `json:"type,omitempty"`
}

type SecretMetadata struct {
	Name        string            `json:"name"`
	Namespace   string            `json:"namespace,omitempty"`
	Labels      map[string]string `json:"labels,omitempty"`
	Annotations map[string]string `json:"annotations,omitempty"`
}

func argoSecretTransform(this js.Value, args []js.Value) interface{} {

	// Get arguments from Pepr
	rawRequest := args[0].String()
	// admissionRequest := args[1].String()
	targetHost := args[2].String()
	pushUsername := args[3].String()
	pullPassword := args[4].String()
	pullUsername := args[5].String()

	fmt.Println(rawRequest)
	secret := &CustomSecret{}

	err := json.Unmarshal([]byte(rawRequest), secret)
	if err != nil {
		fmt.Println("error unmarshalling to secret", err)
	}

	secretURL, err := transform.GitURL(targetHost, secret.Data.Url, pushUsername)
	if err != nil {
		fmt.Printf(ArgoSecretSwap, err)
		return err
	}

	secret.Data.Url = secretURL.String()
	secret.Data.Password = pullPassword
	secret.Data.Username = pullUsername
	secretBytes, err := json.MarshalIndent(secret, "", "  ")
	if err != nil {
		fmt.Println("Error marshal secret to bytes:", err)
		return err
	}

	SecretString := string(secretBytes)
	return string(SecretString)
}

func repoURLTransform(this js.Value, args []js.Value) interface{} {

	// Get arguments from Pepr
	rawRequest := args[0].String()
	// admissionRequest := args[1].String()
	targetHost := args[2].String()
	pushUsername := args[3].String()

	// app := &appv1.Application{}
	app := &ArgoApplication{}

	var originalArgoMap map[string]interface{}
	var updatedArgoMap map[string]interface{}
	var updatedArgoBytes []byte

	// Unmarshal the byte string into the originalArgoMap
	err := json.Unmarshal([]byte(rawRequest), &originalArgoMap)
	if err != nil {
		log.Fatal(err)
	}

	// Unmarshal the byte string into the App Struct
	err = json.Unmarshal([]byte(rawRequest), &app)
	if err != nil {
		log.Fatal(err)
	}

	// Mutate the repoURLs on the ArgoApp
	err = transformAppRepoURLs(app, targetHost, pushUsername)
	if err != nil {
		fmt.Println("error mutating repoURLs on the ArgoApp")
		return err
	}

	// Marshall the updated ArgoApp to bytes
	updatedArgoBytes, err = json.Marshal(app)
	if err != nil {
		fmt.Println("Error marshalling updated ArgoApp to bytes")
		return err
	}

	err = json.Unmarshal(updatedArgoBytes, &updatedArgoMap)
	if err != nil {
		fmt.Println("Error unmarshalling updatedArgoBytes to updatedArgoMap")
		return err
	}

	sources, ok := originalArgoMap["spec"].(map[string]interface{})["sources"].([]interface{})
	if !ok {
		fmt.Println("Failed to extract original sources from the object.")
		return fmt.Errorf("Failed to extract original sources from the object.")
	}
	for i, source := range sources {
		sourceMap, ok := source.(map[string]interface{})
		if !ok {
			fmt.Println("Failed to extract source map.")
			continue
		}
		sourceMap["repoURL"] = app.Spec.Sources[i].RepoURL

	}

	if app.Spec.Source.RepoURL != "" {
		if spec, ok := originalArgoMap["spec"].(map[string]interface{}); ok {
			if source, ok := spec["source"].(map[string]interface{}); ok {
				source["repoURL"] = app.Spec.Source.RepoURL
			}
		}
	}

	appBytes, err := json.MarshalIndent(originalArgoMap, "", "  ")
	if err != nil {
		fmt.Println("Error:", err)
		return err
	}

	// Convert the JSON bytes to a string
	AppString := string(appBytes)
	return string(AppString)
}
func podTransform(this js.Value, args []js.Value) interface{} {

	// Get arguments from Pepr
	rawRequest := args[0].String()
	// admissionRequest := args[1].String()
	imagePullSecretName := args[2].String()
	targetHost := args[3].String()

	pod := &corev1.Pod{}

	// Unmarshal the JSON string into the data variable
	err := json.Unmarshal([]byte(rawRequest), pod)
	if err != nil {
		log.Fatal(err)
	}
	// Convert the interface to a JSON byte array
	podBytes, err := json.Marshal(pod)
	if err != nil {
		log.Fatal(err)
	}

	// unmarshal podBytes into pod
	err = json.Unmarshal(podBytes, pod)
	if err != nil {
		fmt.Println("Error unmarshalling pod", err)
		return err
	}

	// don't do anything if pod has ignore labels
	if checkIgnoreLabels(pod) {
		fmt.Println("Pod has ignore labels, ignoring")
		return nil
	}

	addImagePullSecret(pod, imagePullSecretName)
	transformContainerImages(pod, targetHost)
	addPatchedLabel(pod)

	podBytes, err = json.MarshalIndent(pod, "", "  ")
	if err != nil {
		fmt.Println("Error:", err)
		return nil
	}

	// Convert the JSON bytes to a string
	podString := string(podBytes)
	return string(podString)
}
func addPatchedLabel(pod *corev1.Pod) {
	pod.Labels["zarf-agent"] = "patched"
}
func checkIgnoreLabels(pod *corev1.Pod) bool {
	// check if pod has ignoreLables
	if pod.Labels["zarf-agent"] == "patched" || pod.Labels["zarf.dev/agent"] == "ignore" {
		// We've already played with this pod, just keep swimming 🐟
		return true
	}
	return false
}

func addImagePullSecret(pod *corev1.Pod, imagePullSecretName string) {
	pod.Spec.ImagePullSecrets = append(pod.Spec.ImagePullSecrets, corev1.LocalObjectReference{
		Name: imagePullSecretName,
	})
}
func transformAppRepoURLs(app *ArgoApplication, targetHost string, pushUsername string) error {
	// update repoURL for each source
	for idx, source := range app.Spec.Sources {
		// GitTransformHost transform.GitURL(zarfState.GitServer.Address, patchedURL, zarfState.GitServer.PushUsername)
		replacement, err := transform.GitURL(targetHost, source.RepoURL, pushUsername)
		if err != nil {
			fmt.Printf(RepoURLHostSwap, err)
			continue // Continue, because we might as well attempt to mutate the other Sources for this App
		}
		app.Spec.Sources[idx].RepoURL = fmt.Sprintf("%s", replacement.String())
	}

	if app.Spec.Source.RepoURL != "" {
		// update repoURL for source
		replacement, err := transform.GitURL(targetHost, app.Spec.Source.RepoURL, pushUsername)
		if err != nil {
			fmt.Printf(RepoURLHostSwap, err)
			return err
		}
		app.Spec.Source.RepoURL = fmt.Sprintf("%s", replacement.String())
	}
	return nil
}
func transformContainerImages(pod *corev1.Pod, targetHost string) {
	// update the image host for each init container
	for idx, container := range pod.Spec.InitContainers {
		replacement, err := transform.ImageTransformHost(targetHost, container.Image)

		if err != nil {
			fmt.Printf(AgentErrImageSwap, err)
			continue // Continue, because we might as well attempt to mutate the other containers for this pod
		}
		pod.Spec.InitContainers[idx].Image = replacement
	}

	// update the image host for each ephemeral container
	for idx, container := range pod.Spec.EphemeralContainers {
		replacement, err := transform.ImageTransformHost(targetHost, container.Image)
		if err != nil {
			fmt.Printf(AgentErrImageSwap, err)
			continue // Continue, because we might as well attempt to mutate the other containers for this pod
		}
		pod.Spec.EphemeralContainers[idx].Image = replacement
	}

	// update the image host for each normal container
	for idx, container := range pod.Spec.Containers {
		replacement, err := transform.ImageTransformHost(targetHost, container.Image)
		if err != nil {
			fmt.Printf(AgentErrImageSwap, err)
			continue // Continue, because we might as well attempt to mutate the other containers for this pod
		}
		pod.Spec.Containers[idx].Image = replacement
	}
}
func main() {
	done := make(chan struct{})
	// https://github.com/golang/go/issues/25612
	js.Global().Set("zarfTransform", make(map[string]interface{}))
	module := js.Global().Get("zarfTransform")
	module.Set("podTransform", js.FuncOf(podTransform))
	module.Set("repoURLTransform", js.FuncOf(repoURLTransform))
	module.Set("argoSecretTransform", js.FuncOf(argoSecretTransform))
	<-done
}
