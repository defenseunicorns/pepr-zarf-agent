package main

import (
	"encoding/base64"
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

func base64EncodeToBytes(str string) []byte {
	return []byte(base64.StdEncoding.EncodeToString([]byte(str)))
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

	// for key, value := range secret.Data {
	// 	fmt.Printf("key %s value %s\n", key, string(value))
	// }

	//originalSecretURLDecoded, err := base64.StdEncoding.DecodeString(string(secret.Data["url"]))
	// if err != nil {
	// 	fmt.Println("could not decode secret", err)
	// }
	// secret.Data.Url
	// fmt.Println("Decoded value ", string(originalSecretURLDecoded))

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

	// Convert the JSON bytes to a string
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
	// Define a variable to hold the parsed JSON data
	var data map[string]interface{}

	// Unmarshal the JSON string into the data variable
	err := json.Unmarshal([]byte(rawRequest), &data)
	if err != nil {
		log.Fatal(err)
	}
	// Convert the interface to a JSON byte array
	appBytes, err := json.Marshal(data)
	if err != nil {
		log.Fatal(err)
	}

	// unmarshal podBytes into pod
	err = json.Unmarshal(appBytes, app)
	if err != nil {
		fmt.Println("Error unmarshalling app", err)
	}

	err = transformAppRepoURLs(app, targetHost, pushUsername)
	if err != nil {
		return err
	}
	// // Marshal transformed app back into bytes
	// appBytes, err = json.Marshal(app)
	// if err != nil {
	// 	fmt.Println("Error unmarshalling app", err)
	// 	return err
	// }

	// // Create a map to hold the decoded data
	// var transformedAppMap map[string]interface{}

	// // Unmarshal the JSON data into the map
	// err = json.Unmarshal(appBytes, &transformedAppMap)
	// if err != nil {
	// 	fmt.Println("Error unmarshalling appBytes into transformedAppMap", err)
	// 	return err
	// }

	// // overwrite original map with transformedAppMap
	// transformedMap := helpers.MergeMapRecursive(data, transformedAppMap)
	// // PrettyPrint
	// // Create an empty interface to unmarshal the JSON string
	// // Marshal the Pod object into a pretty printed JSON string
	appBytes, err = json.MarshalIndent(app, "", "  ")
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

	// Define a variable to hold the parsed JSON data
	var data map[string]interface{}

	// Unmarshal the JSON string into the data variable
	err := json.Unmarshal([]byte(rawRequest), &data)
	if err != nil {
		log.Fatal(err)
	}
	// Convert the interface to a JSON byte array
	podBytes, err := json.Marshal(data)
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

	// PrettyPrint
	// Create an empty interface to unmarshal the JSON string
	// Marshal the Pod object into a pretty printed JSON string
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
