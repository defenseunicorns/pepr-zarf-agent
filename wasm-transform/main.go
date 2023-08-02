package main

import (
	"encoding/json"
	"fmt"
	"log"
	"syscall/js"

	corev1 "k8s.io/api/core/v1"
	// appv1 "github.com/argoproj/argo-cd/v2/pkg/apis/application/v1alpha1"
	"github.com/defenseunicorns/zarf/src/pkg/transform"
)

const AgentErrImageSwap = "Unable to swap the host for (%s)"
const RepoURLHostSwap = "Unable to swap repoURL for (%s)"

type Source struct {
	RepoURL string `json:"repoURL"`
}

type ArgoApplication struct {
	Spec struct {
		Source  Source   `json:"source"`
		Sources []Source `json:"sources"`
	}
}

func repoURLTransform(this js.Value, args []js.Value) interface{} {

	// Get arguments from Pepr
	rawRequest := args[0].String()
	// admissionRequest := args[1].String()
	targetHost := args[2].String()
	pushUsername := args[3].String()

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

	// // don't do anything if pod has ignore labels
	// if checkIgnoreLabels(pod) {
	// 	fmt.Println("Pod has ignore labels, ignoring")
	// 	return nil
	// }

	transformAppRepoURLs(app, targetHost, pushUsername)
	// addPatchedLabel(pod)

	// fmt.Printf("%s\n", pod.Name)
	fmt.Printf("App\n%+v", app)

	// PrettyPrint
	// Create an empty interface to unmarshal the JSON string
	// Marshal the Pod object into a pretty printed JSON string
	appBytes, err = json.MarshalIndent(app, "", "  ")
	if err != nil {
		fmt.Println("Error:", err)
		return nil
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
	}

	// don't do anything if pod has ignore labels
	if checkIgnoreLabels(pod) {
		fmt.Println("Pod has ignore labels, ignoring")
		return nil
	}

	addImagePullSecret(pod, imagePullSecretName)
	transformContainerImages(pod, targetHost)
	addPatchedLabel(pod)

	// fmt.Printf("%s\n", pod.Name)
	fmt.Printf("POD\n%+v", pod)

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
func transformAppRepoURLs(app *ArgoApplication, targetHost string, pushUsername string) {
	// update repoURL for each source
	for idx, source := range app.Spec.Sources {
		fmt.Printf("\nsources\ntargetHost %s\npatchedURL %s\nusername %s\n", targetHost, source.RepoURL, pushUsername)
		// GitTransformHost transform.GitURL(zarfState.GitServer.Address, patchedURL, zarfState.GitServer.PushUsername)
		replacement, err := transform.GitURL(targetHost, source.RepoURL, pushUsername)
		fmt.Printf("URL %s", replacement.String())
		if err != nil {
			fmt.Printf(RepoURLHostSwap, err)
			continue // Continue, because we might as well attempt to mutate the other Sources for this App
		}
		fmt.Println("URL ---- ", replacement.String())
		app.Spec.Sources[idx].RepoURL = fmt.Sprintf("%s", replacement.String())
	}

	if app.Spec.Source != (Source{}) {
		fmt.Printf("\nsource\ntargetHost %s\npatchedURL %s\nusername %s\n", targetHost, app.Spec.Source.RepoURL, pushUsername)
		// update repoURL for source
		replacement, err := transform.GitURL(targetHost, app.Spec.Source.RepoURL, pushUsername)
		if err != nil {
			fmt.Printf(RepoURLHostSwap, err)
		}
		fmt.Printf("URL ---- ", replacement.String())
		app.Spec.Source.RepoURL = fmt.Sprintf("%s", replacement.String())
	}
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
		fmt.Println("replacement", replacement)
		pod.Spec.Containers[idx].Image = replacement
		fmt.Println(pod.Spec.Containers[idx].Image)
	}
}
func main() {
	done := make(chan struct{})
	// https://github.com/golang/go/issues/25612
	js.Global().Set("zarfTransform", make(map[string]interface{}))
	module := js.Global().Get("zarfTransform")
	module.Set("podTransform", js.FuncOf(podTransform))
	module.Set("repoURLTransform", js.FuncOf(repoURLTransform))
	<-done
}
