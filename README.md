# Pepr Module

- [Demo Flow](#demo-flow)
- [Unit Test](#unit-test)
- [Fast Restart](#fast-restart)
- [Lint](#lint)

## Demo Flow

Step 1: (Initialization Phase)

- [x] Get Zarf State from secret and store in state
- [x] Get private-registry secret and store in state

Step 2: (Pre-Mutation Phase)

- [x] Get Pod without ignore labels/annotations
- [x] Deploy private-registry secret to pod namespace

Step 3: (Mutation Phase)

- [x] Mutate pod with imagePullSecret
- [x] Mutate pod with internal registry image
- [x] Annotate pod `zarg-agent: patched`

Step 4: Implement transform pkg for TypeScript with Tests

- [x] Images

```bash
└─[130] <git:(main 054055c✱) > k create ns new-ns
namespace/new-ns created
┌─[cmwylie19@Cases-MacBook-Pro] - [~/pepr-zarf-agent] - [2023-06-20 09:29:57]
└─[0] <git:(main 054055c✱) > k run new-pod -n new-ns --image=ng
inx
pod/new-pod created
┌─[cmwylie19@Cases-MacBook-Pro] - [~/pepr-zarf-agent] - [2023-06-20 09:30:10]
└─[0] <git:(main 054055c✱) > k get secret -n new-ns
NAME               TYPE     DATA   AGE
private-registry   Opaque   1      6s
┌─[cmwylie19@Cases-MacBook-Pro] - [~/pepr-zarf-agent] - [2023-06-20 09:30:16]
└─[0] <git:(main 054055c✱) > k create ns new-ns-2
namespace/new-ns-2 created
┌─[cmwylie19@Cases-MacBook-Pro] - [~/pepr-zarf-agent] - [2023-06-20 09:30:39]
└─[0] <git:(main 054055c✱) > k run ignore-me --image=nginx -l z
arf-agent=ignore -n new-ns-2
pod/ignore-me created
┌─[cmwylie19@Cases-MacBook-Pro] - [~/pepr-zarf-agent] - [2023-06-20 09:31:02]
└─[0] <git:(main 054055c✱) > k get secret -n new-ns-2
┌─[cmwylie19@Cases-MacBook-Pro] - [~/pepr-zarf-agent] - [2023-06-20 09:31:18]
└─[0] <git:(main 054055c✱) >
```

## Unit Test

```bash
$ npx test
  console.log
    [info]              Checking init secrets

      at Logger.log (node_modules/pepr/src/lib/logger.ts:121:17)

  console.log
    [info]              Init secrets not initialized

      at Logger.log (node_modules/pepr/src/lib/logger.ts:121:17)

  console.log
    [info]              Checking init secrets

      at Logger.log (node_modules/pepr/src/lib/logger.ts:121:17)

  console.log
    [info]              Init secrets initialized

      at Logger.log (node_modules/pepr/src/lib/logger.ts:121:17)

 PASS  capabilities/helpers.test.ts
  InitSecretsReady function
    ✓ returns false when secrets are not initialized (18 ms)
    ✓ returns true when secrets are initialized (3 ms)
  HasIgnoreLabels function
    ✓ returns false when pod has no ignore labels
    ✓ returns true when pod has ignore labels
  BuildInternalImageURL
    ✓ should build the internal image URL correctly for a three-section image
    ✓ should throw an error for a malformed image (6 ms)
    ✓ should build the internal image URL correctly for a one-section image
  checkPattern
    ✓ should return true if the beginning string matches the pattern
    ✓ should return false if the beginning string does not match the pattern
  ParseAnyReference
    ✓ parses valid image references correctly (1 ms)
  GetCRCHash
    ✓ creates the correct crc32 hashes
  ImageTransformHost
    ✓ transforms valid image references correctly
    ✓ throws errors for invalid image references (1 ms)
  ImageTransformHostWithoutChecksum
    ✓ transforms valid image references correctly (1 ms)
    ✓ throws errors for invalid image references

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        0.968 s, estimated 2 s
Ran all test suites.
```

## Fast Restart

- Rebuild pepr-module
- create the manifests
- delete all pods in the pepr-system namespace
- tail the logs of the pepr-system deployment

```bash
kind delete clusters --all;
docker image prune -a -f;
kind create cluster
pepr build;k create -f dist;k delete po -n pepr-system --all --force; sleep 35;k wait --for=condition=Ready pod -l app -n pepr-system --timeout=180s;k logs deploy/$(kubectl get deployments --output=jsonpath='{.items[0].metadata.name}' -n pepr-system) -f -n pepr-system

k create ns zarf

k create -f -<<EOF
apiVersion: v1
data:
  state: eyJ6YXJmQXBwbGlhbmNlIjpmYWxzZSwiZGlzdHJvIjoia2luZCIsImFyY2hpdGVjdHVyZSI6ImFybTY0Iiwic3RvcmFnZUNsYXNzIjoic3RhbmRhcmQiLCJhZ2VudFRMUyI6eyJjYSI6IkxTMHRMUzFDUlVkSlRpQkRSVkpVU1VaSlEwRlVSUzB0TFMwdENrMUpTVVJYVkVORFFXdEhaMEYzU1VKQlowbFJaRmRHZURoRFJrRkpjM0kwUkZCTVIwOVhOamxXUkVGT1FtZHJjV2hyYVVjNWR6QkNRVkZ6UmtGRVFUTUtUVkpqZDBaUldVUldVVkZMUlhjMVlWbFlTbTFKUlU1MllsY3hNV0p0YkRCbFZFVmpUVUp2UjBFeFZVVkJlRTFVV1RKRmRXTklTbkJrYlVZd1dsTTFOZ3BaV0VwdFRHMVNiR1JxUVdWR2R6QjVUWHBCTWsxVVozaE9WRUY0VFZSR1lVWjNNSGxPUkVFeVRXcGplRTVVUVhoTlZFWmhUVVJqZUVaNlFWWkNaMDVXQ2tKQmIxUkViSEJvWTIxWloxRXlPWFJpV0ZaMVlWaFNOVTFTZDNkSFoxbEVWbEZSUkVWNFRtcFpVelYzWTIxc01sbFlVbXhNYm5Cb1kyMVpkVnBIVmpJS1RVbEpRa2xxUVU1Q1oydHhhR3RwUnpsM01FSkJVVVZHUVVGUFEwRlJPRUZOU1VsQ1EyZExRMEZSUlVGd1VXeFJUbW9yYjNOdGNrNVZhWFZZV0dRNWRBcGFUbFE1VG5SM00zTlJjbkpZT1ZscFdVdzJZV2RGVEdoR1ltbElURXhxV0RrdlJGZHZjQ3QzWlZWTmMyOXVZVTVrVG5jdlVtWnNVbU12YjA1MlVUaFlDakkxUzFOSlVtVjBSRk5rV2xOSFVGUlRaMnR4WlVKcVZtZEVlVUpRUlRsWFMweFNLMmxxTUM5b01FZzVibFpzVjNod1NFZGxTRWR2Wms1SWJGaFpWMllLZDNCQmJtSjJiV3RUYjJkWWFHTm1kVlZHT1ZwSFJrdE9SbkJGWXk5T1Z6VlFUbUkwYjFWS01tZEdRMFJJWm5WSVExSXZObkIwTVV0dmQyaHFXaXRqTlFwbmNVcHphV0psWXpVNVMxWldMMmswVjFoNFdqTkJiMlZLTUZoeGFERmpNMVJrY2xFM0t6SnJlR053WkRCS1RYcDJVVXRoYUZGS00yRkZSSFp1TWtsMENubHBlbTFuYlRCWVkxQlZWWEZUZW5rM09HTTVTV05qTDA0NGVXOVpOVTVUTTFGd1VXMXJhVUZZVjNBeVlWbEZNakZZTkVSSk9GQTJiSHBYUjB3M01FUUthRkZKUkVGUlFVSnZNa1YzV0hwQlQwSm5UbFpJVVRoQ1FXWTRSVUpCVFVOQmIxRjNTRkZaUkZaU01HeENRbGwzUmtGWlNVdDNXVUpDVVZWSVFYZEZSd3BEUTNOSFFWRlZSa0ozVFVOTlFUaEhRVEZWWkVWM1JVSXZkMUZHVFVGTlFrRm1PSGRJVVZsRVZsSXdUMEpDV1VWR1FUaFJaWG94VTNGcWVVRjNhV05vQ2pkak5WVlNkWEYxV1VWUllVMUJNRWREVTNGSFUwbGlNMFJSUlVKRGQxVkJRVFJKUWtGUlEyb3ZPRmd3UW5CWlZuTmpaV1pJY0dOV1VWQk5XV1EwU1VFS1dtdFFkbU5DZVhKR1RqQnZUMjlVZUhWYWFteExURmswZERKUFJYQk5hVVphVVZOSGJraGpjR1p3T0VORE0zSm5NMUJaWjJoSGJuWm5ValUxY1VkcFp3bzBjVzExVXpCTVYzcDRkRVp0ZVZNd1RUWjNXSGM1V1ZKdVIwbHBkVTUyU2psTVlYbDFiVTFtS3poVmFWTTFPSGxyWnpKUFIzSjVVM05yTmpkdWQySm9DblpFV0hFclRtOXlNblp6VjJGWWFWVjBXWEIwU1d0Tk1HeDNZbEp4ZVRSbGQwZzRWM1Z5UlZCV1ZYTmthbWxLUmtWdWJ6WXhiWEZzVVd0RGFWSlFXbElLYjFGNWVtWTFhRFZ0VGtOTE5GUXdVbXRIV0VWeFEwcGxaRGRPWnpSRk5WaHhiRTFMYWxSNmVtWjVkMmt6VTJwV2FWcEJWMmxOY1cxT2RWTTROWGhrTkFvdlJHVnVPVmh1YzJ4NUwzbFhja2RHU0VOdmFISjJNSHBVWWxCRU0zSlhiV3BsVEZwdldFWlRXVzA1UjFSd1REUTVUM3B2V0dSb1QxTmhkSEVLTFMwdExTMUZUa1FnUTBWU1ZFbEdTVU5CVkVVdExTMHRMUW89IiwiY2VydCI6IkxTMHRMUzFDUlVkSlRpQkRSVkpVU1VaSlEwRlVSUzB0TFMwdENrMUpTVVJqYWtORFFXeHhaMEYzU1VKQlowbFJaV294WWtodFNTdGxZMXBuTkV4VmRrdHVabUZMVkVGT1FtZHJjV2hyYVVjNWR6QkNRVkZ6UmtGRVFUTUtUVkpqZDBaUldVUldVVkZMUlhjMVlWbFlTbTFKUlU1MllsY3hNV0p0YkRCbFZFVmpUVUp2UjBFeFZVVkJlRTFVV1RKRmRXTklTbkJrYlVZd1dsTTFOZ3BaV0VwdFRHMVNiR1JxUVdWR2R6QjVUWHBCTWsxVVozaE9WRUY0VFZSS1lVWjNNSGxPUkVFeVRXcGplRTVVUVhoTlZFcGhUVVJWZUVaVVFWUkNaMDVXQ2tKQmIxUkVSbkJvWTIxWloxRXllREZqTTFKc1kycEZZMDFDYjBkQk1WVkZRWGhOVkZsWFpHeGlibEYwWVVjNWRtRjVOVFpaV0VwdFRHNU9NbGw2UTBNS1FWTkpkMFJSV1VwTGIxcEphSFpqVGtGUlJVSkNVVUZFWjJkRlVFRkVRME5CVVc5RFoyZEZRa0ZPZURaM1NqTjZWRmx5YWxGbFUyaFBOWGxNTmpGUVp3cDZVbWRKSzFSTFEzSk9Ubko2Y1ZCV1dUWlBPV0p0Wm5STWRYVkVLMFJIV1U4M1NITk9UMXBTTmxoT1IxQkZjMHBKUjNaV05HVnFVM2RRYUdGWGFqWkRDbTFUVGpFMFEwTldSR05CVEhWbllrRkhkM1pOTmpBNGExSjRLemQ0WmxwdlJXdHlSV3BMY1hkdk56Wk1jMDlTU3pWa1IzQjVaa3RWTDBGdVRUQlhaMFFLWkUxeVNqUm5WbEp6U2pWYWFWY3ZWVWxNZEVKbGJ6SkZZM0JLVWxoQ2VtY3JZamt3VEhRM1pXVnhSRzlqVDNkdVVUTnVVblJ2VTFSSFUyWXhZWEJZWlFwSVdHSmlaV2tyTkRnMFFUSldRVGQyV214M1IzRkJNVTl4UTNBclNYUkJNRkZ1VEc5Rk5FRXpVSGN2SzJ3d05tbEhkMFZWZUVkblVuSkNPVTFPU2pONENsaEZUVzFDT1VnM05IUm9lazVxZERVemFXMUJabU51VDJrNGNtaGxXVGRzT0dObFpWQlVUWHBVU3poVGVYRktiRlpCY1VFeFNIaEdTVWRUTHpSalJVTUtRWGRGUVVGaFRqaE5TRzkzUkdkWlJGWlNNRkJCVVVndlFrRlJSRUZuVjJkTlFrMUhRVEZWWkVwUlVVMU5RVzlIUTBOelIwRlJWVVpDZDAxQ1RVRjNSd3BCTVZWa1JYZEZRaTkzVVVOTlFVRjNTSGRaUkZaU01HcENRbWQzUm05QlZVUjRRamRRVmt0eFVFbEVRMHA1U0hSNmJGSkhObkUxWjFKQ2IzZEtRVmxFQ2xaU01GSkNRakIzUnpSSlZGbFhaR3hpYmxGMFlVYzVkbUY1TlRaWldFcHRURzVPTWxrMFkwVm1kMEZCUVZSQlRrSm5hM0ZvYTJsSE9YY3dRa0ZSYzBZS1FVRlBRMEZSUlVGSUwwNHlZakUyU0N0dlpqbEVlWGxWY3l0aloyNW5VSHBrV20xcGVEaHBWRkV2Y25wdmFFSjJhbWxZYVRCellVZHdXR0ZyYURJMFRRcHRPRUV6VWtkck9YcGlaV0pGYldsMVRITnBXRUZXYnk5MFRVcFJhVEZPZW5neGFVeFFhWE13ZWpKWVF6UnhVek50Wmt0SlNHdG1NRUl2ZEN0SE4yOXVDaTkxVFZndlFUSkNUemxIY1dKamMzcHJhRmQyWmxrMWFHRjBWRFJSUjJFemFFbDVXblpEZDFwSlFXZDBhblF6UmpVd1MwMWlZVE5rUzFoTWNrMVlZVzhLVFRSaVFWbEpaM001V1hsb09XUlpibkZEY1hOdE4zaFdTRTltT1RKTmMyOHZWRGh5UWxJd016bEhOemhSY1VweGVuTXZkMlZFV1RSb1JYZFNlbFJQTUFwWFNXTlJUalZpZGpSTlRsQTJSMHAyVmxOa05uVnhLMFpGYVV4WFYzb3lWbmRtVkdwQmJHYzNRM2N5Y1VKWU5HcGFLelJpZHpRMGFEVnlWRWxrZUVNdkNtbEdhMkU1UWtJeGRGbG9NMnRHTjFoUVVIbFVaV0pxVGt4bFlsYzRRVDA5Q2kwdExTMHRSVTVFSUVORlVsUkpSa2xEUVZSRkxTMHRMUzBLIiwia2V5IjoiTFMwdExTMUNSVWRKVGlCU1UwRWdVRkpKVmtGVVJTQkxSVmt0TFMwdExRcE5TVWxGYjNkSlFrRkJTME5CVVVWQk0waHlRVzVtVGs1cGRVNUNOVXRGTjI1SmRuSlZLMFJPUjBGcU5VMXZTM013TW5aUGJ6bFdhbTgzTVhWYUt6QjFDalkwVURSTldtYzNjMlYzTURWc1NIQmpNRms0VTNkcloyRTVXR2cyVGt4QkswWndZVkJ2UzFwSk0xaG5TVXBWVG5kQmRUWkNjMEZpUXpoNmNsUjVVa2dLU0RkMlJqbHRaMU5UYzFOTmNYSkRhblp2ZFhjMVJYSnNNR0Z1U2pod1ZEaERZM3BTWVVGT01IbHpibWxDVmtkM2JteHRTbUk1VVdkMU1FWTJhbGxTZVFwcmJFWmpTRTlFTlhZelVYVXpkRFUyYjA5b2R6ZERaRVJsWkVjeWFFcE5Xa292Vm5Gc1pEUmtaSFIwTmt3M2FucG5SRnBWUkhVNWJWaEJZVzlFVlRadkNrdHVOR2t3UkZKRFkzVm5WR2RFWXk5RUx6WllWSEZKWWtGU1ZFVmhRa2R6U0RCM01HNW1SbU5SZVZsSU1HWjJhVEpJVFRKUE0yNWxTMWxDT1hsak5rd0tlWFZHTldwMVdIaDROVFE1VFhwT1RYSjRURXR2YlZaVlEyOUVWV1pGVldkYVRDOW9kMUZKUkVGUlFVSkJiMGxDUVVSRVpWUkdPREpHUmxCaFpIcHdlZ3AxYTBSRGFYQkNNak5VTm1OcWJ6bDRaekZyUWtwcVdVOUZRakl3TWxGdVZDdHVhR1JOWkM5alVFTTNPV2xsVVdFNU9FZEVTMk16THpSa00wVTVSMDlyQ21kMk1FcEhZMDlPVFhWQk0wOXJkeXRtVjA4MWRHRjJWbGhMYkVzM1JWVkpXak5PVkV4V1pXMVVXbVZuTlZGVVdWUm9URzQxTTJSVFYyOXZWVTVvZVRnS2FGQnBka2Q1VFZFd1VYYzFibmN4UzNjdmFqRkpORGxVTVRCV2NHNXVNV0pFZEhjMlpuVlNUMHRDVjJaS1duRnZOR3BHVWtGTlpYUnlVbXhTWm0xUVRBb3dkMm81TTNkQlNEZG9kamRWWldKb1lrbGhUVmhqTURWcVJreHpUek16U2t4S2RpOVNVR1k0Y1RVdmR6Rk9XR0YzZEdzMVJUZDBOVEE1YUV3MWFUQlZDblJNV0RCYU56UmhWVEpxWVcxaGNUZzRibWdyTmxCMU56WkZNRzB3YVZncmRHTnpUWEZ2UTFacU5pOVhhVWhhTjJjeFdscFpUQzlFWlVZMlpFVkxNbVFLVEc1VU9YTm1hME5uV1VWQk16bDVTVk5oZDBodWRVWkJkV3QxWVhKc2FHMDViVlpuTm5oWGFTdE9RalV3WlRBMlZVVmlOM0ZRZERCVlNHdFBUaTlwYndvM05XTnFUSEUwY0ZreE5TOVhTMUJxWlcxU0x6VnZORGR4VjBWaVdqWllWaXRHY0VSTloyWXpOVEp6VUhoeGRYSjJkVXQ1TVhwbVdITmpTbUZNTVVoeUNubERXbFZyYUhReU1sWm1RbGh3VWxnMFRVTnNSVXB1TTAxNFVtWkJUMFZoZUdJNE1tWkZjVU16TnpSeFVYSnJUVEYxYlZwWFl6aERaMWxGUVM5RFNITUtkMDFITDJjdlJYcGFaR04zYVc1bWJYUk5lWGNyVFZKVFQyaDZlR2xzV0RGd04wcHNOMmN3ZVZrNFpTdEpPRWxPZW1ncmVFMURTeklyUW1NeWR6RXZhZ28xU3prME5tVlllV1ZOVnpaYWEzaG5WMDgzVm1KVGJHZ3laVVU1ZWxKNmFuRkRNRXBGV1VNeE4wNXdTalJXZG1wa1kycERXRFEzV2t4bmIzaFdZMGhPQ21Nd2FVTmtSR0U0TlhCT1IwazBXVzlCVUdOS01ETlBaWGgzVjFOYVdFaHZVRlpHV1ZBeU9FTm5XVUYzYW1vMFJtUk5ibTFZVldSVU5GTm5ORE55V0dVS2FHUnFRM2hPZFc1cGJHbFNMM2h0YURWbVQyRkZTV2xJUml0eVRXMTVVRkpoTHk5WGJGUkpiU3R2TURKd1lqSnRaek4yTW1aNU1WUnlUblJ5TTA0eVVBcFZPSGt4V1cxTlZVUXZXRXBEZERGcGRIWjBRbXRVZHpSek1GbHhZekpPYmpneVFuVnVTVkp1TW1jdk5FOXpZbWN5WjJkNmJFdEhOSE0xWkhwemJDOUVDazl3YkZBeGFqSlRNa1ZYUlZkWGVpdG9TV0ZrYjNkTFFtZFJRMFpSVkZSTmNERnRaREZWVUZJMWEzQnpWa2hTYkZJck1tTm1URE56YjNSR2VIbElObVFLTUN0aFZsTjJieTk2UW1sTk9EUnRlVlZCVDI5eGFVSkVka3ByWmpWNlZXUTNlazlpWjNkSFJXNVNVVzQzZFZCWkwwNXNiRFpWU1dwRmFURkZhelpyY1FwblEzSlVlV3N2WTFRek5VOXJaVGhGYlVWa1MyczRabkV3YXpWRGQySjJaekozYVM5bVVrdFlWbTE2ZVZvemQweEViMVowT0ZOVFVXdFVlRkJUTUZaMkNqWjFZMWRHZDB0Q1owaHpaaTluTXpWWk1sSjJielZTVUZNeVZXbE1jRmhZU25VMWJXSkRSVGh2ZVRGT1lUTmhXVVIyZWpaSVl6aE1WM0ZSV0RKTGVUZ0tWekJzUVRWdlFXUTJOM001YWxob01VMDBUV1Z1YkVGbkt6RXdjamw0Y2xKVldpOXJUMEpxTUZaQlpuRXlUVzlRUmtKSU9HTnJZakZFZFdKcU5tVnVZUXB6VmxCcVlVaFlkamd5WXpob1dGZE9NV1JQTW5wUU4wcFNkM2xPVVhvMGRtdERNSE5WWkdkeFdURlNiakZTZWpBNGExbGhDaTB0TFMwdFJVNUVJRkpUUVNCUVVrbFdRVlJGSUV0RldTMHRMUzB0Q2c9PSJ9LCJnaXRTZXJ2ZXIiOnsicHVzaFVzZXJuYW1lIjoiemFyZi1naXQtdXNlciIsInB1c2hQYXNzd29yZCI6IkRITmdWdkhIOWRiQUE1dmNCZzNPa2NJISIsInB1bGxVc2VybmFtZSI6InphcmYtZ2l0LXJlYWQtdXNlciIsInB1bGxQYXNzd29yZCI6IlpaYnJpZFVJcXRVNnU1ekY5WkIyNWdmbyIsImFkZHJlc3MiOiJodHRwOi8vemFyZi1naXRlYS1odHRwLnphcmYuc3ZjLmNsdXN0ZXIubG9jYWw6MzAwMCIsImludGVybmFsU2VydmVyIjp0cnVlfSwicmVnaXN0cnlJbmZvIjp7InB1c2hVc2VybmFtZSI6InphcmYtcHVzaCIsInB1c2hQYXNzd29yZCI6ImM5RnduM1pneVZyWHF3SldXSko0bmVVSSIsInB1bGxVc2VybmFtZSI6InphcmYtcHVsbCIsInB1bGxQYXNzd29yZCI6IjUzc2xBUTlPS1hRbTF+R0pxZG5HeDZ+bSIsImFkZHJlc3MiOiIxMjcuMC4wLjE6MzE5OTkiLCJub2RlUG9ydCI6MzE5OTksImludGVybmFsUmVnaXN0cnkiOnRydWUsInNlY3JldCI6ImFCRH54LXA4Z0R6aG1TUWEwdGlQRFI0SEFCaFpZZUJSQVNYcU5IdjVWRGZVZUdoZiJ9LCJhcnRpZmFjdFNlcnZlciI6eyJwdXNoVXNlcm5hbWUiOiJ6YXJmLWdpdC11c2VyIiwicHVzaFBhc3N3b3JkIjoiIiwiYWRkcmVzcyI6Imh0dHA6Ly96YXJmLWdpdGVhLWh0dHAuemFyZi5zdmMuY2x1c3Rlci5sb2NhbDozMDAwL2FwaS9wYWNrYWdlcy96YXJmLWdpdC11c2VyIiwiaW50ZXJuYWxTZXJ2ZXIiOnRydWV9LCJsb2dnaW5nU2VjcmV0IjoiVTl6TFNhNXlZMk5TQ0xEITFhRi1BSUhpIn0=
kind: Secret
metadata:
  labels:
    app.kubernetes.io/managed-by: zarf
  name: zarf-state
  namespace: zarf
type: Opaque
EOF


k create -f -<<EOF
apiVersion: v1
data:
  .dockerconfigjson: eyJhdXRocyI6eyIxMjcuMC4wLjE6MzE5OTkiOnsiYXV0aCI6ImVtRnlaaTF3ZFd4c09qVXpjMnhCVVRsUFMxaFJiVEYrUjBweFpHNUhlRForYlE9PSJ9fX0=
kind: Secret
metadata:
  labels:
    app: zarf-injector
    app.kubernetes.io/managed-by: zarf
    zarf.dev/agent: ignore
  name: private-registry
  namespace: zarf
type: kubernetes.io/dockerconfigjson
EOF
```

## Lint

Lint the code

```bash
npx prettier --write .
```
