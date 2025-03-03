import {create} from 'zustand'
import {createJSONStorage, persist} from "zustand/middleware"
import deepmerge from "deepmerge"
import {LatencyRequestMethod} from "../../api/speedtest/requests/latency-request.ts"
import useTestFileConfigurationStore from "./test-file-configuration-state.ts"
import {ITestFileDefinition} from "../../api/test-files/test-file-definition.ts";

export interface ILatencyTestState {
    enabled: boolean
    method: LatencyRequestMethod
    parameters: {
        minDelay: number
        maxDuration: number
        maxRequests: number
    }
}

export const latencyTestStateDefaults: ILatencyTestState = {
    enabled: true,
    method: LatencyRequestMethod.HEAD,
    parameters: {
        minDelay: 100,
        maxDuration: 5_000,
        maxRequests: 25
    }
}

export interface ILatencyTestStateActions {
    setEnabled: (enabled: boolean) => void
    setMethod: (method: LatencyRequestMethod) => void
    setParameters: (minDelay: number | undefined, maxDuration: number | undefined, maxRequests: number | undefined) => void
    resolveTestFileDefinition: () => ITestFileDefinition | undefined
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
                setEnabled: value => set({...get(), enabled: value}),
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
                },
                resolveTestFileDefinition: () => {
                    const currentState = get()
                    if (currentState._ctrl.readyToBeUsed)
                        return undefined
                    const testFileStoreState = useTestFileConfigurationStore.getState()
                    if (!testFileStoreState._ctrl.readyToBeUsed)
                        return undefined
                    return testFileStoreState.testFileConfiguration?.noDataDefinitions[0]
                }
            },
            _ctrl: {
                readyToBeUsed: false,
                bootstrap: async () => {
                    const currentState = get()
                    if (currentState._ctrl.readyToBeUsed)
                        return
                    const testFileStoreState = useTestFileConfigurationStore.getState()
                    if (!testFileStoreState._ctrl.readyToBeUsed)
                        return testFileStoreState._ctrl.bootstrap().then(() => currentState._ctrl.bootstrap())

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
                    enabled: state.enabled,
                    method: state.method,
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