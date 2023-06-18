# Initial POC

_The goal is to implement the Zarf Agent in Pepr utilizing dependency injection to loosely couple hook implementations of objects like pods and flux._  

**For the initial vertical,the focus is on pod logic.**

_High Level Overview_:
* Zarf Agent needs to be deployed before Zarf deploys artifacts. (Alternatively we could mount the zarf secret into the agent pod)

  * Pods - Agent must mutate the `imagePullSecrets` and `image` to use the internal registry.

    * `imagePullSecrets` - The agent will recreate `private-registry` secret in the pod namespace before mutating the pod.

**Checklist**  

Step 1: (Initialization Phase)
- [ ] Get Zarf State from secret and store in state
- [ ] Get private-registry secret and store in state


Step 2: (Pre-Mutation Phase)
- [ ] Get Pod without ignore labels/annotations
- [ ] Deploy private-registry secret to pod namespace

Step 3: (Mutation Phase)
- [ ] Mutate pod with imagePullSecret
- [ ] Mutate pod with internal registry image
- [ ] Annotate pod `zarg-agent: patched`


_715mb CD-ROM is the goal_


[Flow Diagram](https://docs.google.com/drawings/d/1nGiG0keutXLvfbiW1_0LZNI2Gphfda63RTnUhz2DKVQ/edit?usp=sharing)
![Flow Diagram](https://docs.google.com/drawings/d/e/2PACX-1vS-EeJyxbtN_NygaOSc0m2x9vDnBxQkm-e9IstQ761J2ztKSA_G4SF6Fq1NNqBDdBvuT9FEVoGG7dmS/pub?w=962&h=344)


- watch for namespaces without zarf-ignore label



processor.ts 

zarf src/ui has zarf types

pull down PeprRequest instead of any