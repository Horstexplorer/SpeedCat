import {create} from 'zustand'
import {createJSONStorage, persist} from "zustand/middleware"
import deepmerge from "deepmerge"
import {LatencyRequestMethod} from "../../api/speedtest/requests/latency-request.ts"
import useAssetConfigurationStore from "./asset-configuration-state.ts"
import {getPathToAsset} from "../../api/test-files/asset-index.ts"

export interface ILatencyTestState {
    method: LatencyRequestMethod,
    url?: string
    parameters: {
        minDelay: number
        maxDuration: number
        maxRequests: number
    }
}

export const latencyTestStateDefaults: ILatencyTestState = {
    method: LatencyRequestMethod.HEAD,
    url: undefined,
    parameters: {
        minDelay: 100,
        maxDuration: 5_000,
        maxRequests: 25
    }
}

export interface ILatencyTestStateActions {
    setMethod: (method: LatencyRequestMethod) => void
    setParameters: (minDelay: number | undefined, maxDuration: number | undefined, maxRequests: number | undefined) => void
}

export interface ILatencyTestStoreControls {
    readyToBeUsed: boolean
    bootstrap: () => Promise<void>
    resetState: (state?: ILatencyTestState) => void
}

export interface ILatencyTestStore extends ILatencyTestState {
    _actions: ILatencyTestStateActions
    _ctrl: ILatencyTestStoreControls
}

const useLatencyTestStore = create<ILatencyTestStore>()(
    persist(
        (set, get) => ({
            ...latencyTestStateDefaults,
            _actions: {
                setMethod: value => set({...get(), method: value}),
                setParameters: (minDelay, maxDuration, maxRequests) => {
                    const parameters = {...get().parameters}
                    if (minDelay)
                        parameters.minDelay = minDelay
                    if (maxDuration)
                        parameters.maxDuration = maxDuration
                    if (maxRequests)
                        parameters.maxRequests = maxRequests
                    set({...get(), parameters: parameters})
                }
            },
            _ctrl: {
                readyToBeUsed: false,
                bootstrap: async () => {
                    const currentState = get()
                    const assetStore = useAssetConfigurationStore
                    if (!assetStore.getState()._ctrl.readyToBeUsed)
                        return assetStore.getState()._ctrl.bootstrap().then(() => currentState._ctrl.bootstrap())
                    const assetConfig = assetStore.getState().assetConfiguration!
                    // load additional defaults
                    if (!currentState.url) {
                        const assetWithoutPayload = assetConfig.assetsWithNoPayload[0]
                        set({...get(), url: getPathToAsset(assetWithoutPayload)})
                        return currentState._ctrl.bootstrap()
                    }
                    // validate state
                    if (!assetConfig.assetsWithNoPayload.find(asset => getPathToAsset(asset) == currentState.url)) {
                        currentState._ctrl.resetState()
                        return currentState._ctrl.bootstrap()
                    }
                    set({...get(), _ctrl: {...get()._ctrl, readyToBeUsed: true}})
                },
                resetState: state => {
                    const defaults = state || latencyTestStateDefaults
                    set({...get(), ...defaults, _ctrl: {...get()._ctrl, readyToBeUsed: false}})
                }
            }
        }),
        {
            name: "latency-test-state",
            storage: createJSONStorage(() => localStorage),
            partialize: state => {
                return {
                    method: state.method,
                    url: state.url,
                    parameters: {
                        minDelay: state.parameters.minDelay,
                        maxDuration: state.parameters.maxDuration,
                        maxRequests: state.parameters.maxRequests
                    }
                } as ILatencyTestState
            },
            merge: (persistedState: any, currentState) => deepmerge(currentState, persistedState)
        }
    )
)

export default useLatencyTestStore