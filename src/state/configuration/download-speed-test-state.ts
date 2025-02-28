import {create} from 'zustand'
import {createJSONStorage, persist} from "zustand/middleware"
import deepmerge from "deepmerge"
import useAssetConfigurationStore from "./asset-configuration-state.ts"
import Value from "../../api/misc/units/value.ts"
import {DataUnit, DataUnits} from "../../api/misc/units/types/data-units.ts"
import {getDataSizeOfAsset, getPathToAsset} from "../../api/test-files/asset-index.ts"

export interface IDownloadSpeedTestState {
    url?: string,
    payloadSize?: Value<DataUnit>,
    parameters: {
        minDelay: number
        maxDuration: number
        maxRequests: number
    }
}

export const downloadSpeedTestStateDefaults: IDownloadSpeedTestState = {
    url: undefined,
    payloadSize: undefined,
    parameters: {
        minDelay: 0,
        maxDuration: 30_000,
        maxRequests: 100
    }
}

export interface IDownloadSpeedTestStateActions {
    setPayloadSize: (payloadSize: Value<DataUnit>) => void
    setParameters: (minDelay: number | undefined, maxDuration: number | undefined, maxRequests: number | undefined) => void
}

export interface IDownloadSpeedTestStoreControls {
    readyToBeUsed: boolean
    bootstrap: () => Promise<void>
    resetState: (state?: IDownloadSpeedTestState) => void
}

export interface IDownloadSpeedTestStore extends IDownloadSpeedTestState{
    _actions: IDownloadSpeedTestStateActions
    _ctrl: IDownloadSpeedTestStoreControls
}

const useDownloadSpeedTestStore = create<IDownloadSpeedTestStore>()(
    persist(
        (set, get) => ({
            ...downloadSpeedTestStateDefaults,
            _actions: {
                setPayloadSize: value => {
                    const assetStore = useAssetConfigurationStore
                    if (!assetStore.getState()._ctrl.readyToBeUsed)
                        return
                    const assetConfig = assetStore.getState().assetConfiguration!
                    const asset = assetConfig.assetWithPayloadCloseTo(value)
                    if (!asset)
                        return
                    set({...get(), url: getPathToAsset(asset), payloadSize: getDataSizeOfAsset(asset)})
                },
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
                    if (!currentState.payloadSize || !currentState.url) {
                        const asset = assetConfig.assetsWithPayload[0]
                        set({...get(), url: getPathToAsset(asset), payloadSize: getDataSizeOfAsset(asset)})
                    }
                    // validate
                    if (!assetConfig.assetsWithPayload.find(asset => getPathToAsset(asset) == currentState.url
                        && getDataSizeOfAsset(asset).equalsValue(currentState.payloadSize!))) {
                        currentState._ctrl.resetState()
                        return currentState._ctrl.bootstrap()
                    }
                    set({...get(), _ctrl: {...get()._ctrl, readyToBeUsed: true}})
                },
                resetState: state => {
                    const defaults = state || downloadSpeedTestStateDefaults
                    set({...get(), ...defaults, _ctrl: {...get()._ctrl, readyToBeUsed: false}})
                }
            }
        }),
        {
            name: "download-speed-test-state",
            storage: createJSONStorage(() => localStorage, {
                reviver: (key, value) => {
                    if (key == 'payloadSize' && value) {
                        const valueJson = value as {value: number, uid: string}
                        return new Value(valueJson.value, DataUnits.values().find(unit => unit.uid == valueJson.uid)!)
                    }
                    return value
                },
                replacer: (_, value) => {
                    if (value instanceof Value)
                        return {value: value.value, uid: value.unit.uid}
                    return value
                }
            }),
            partialize: state => {
                return {
                    url: state.url,
                    payloadSize: state.payloadSize,
                    parameters: {
                        minDelay: state.parameters.minDelay,
                        maxDuration: state.parameters.maxDuration,
                        maxRequests: state.parameters.maxRequests
                    }
                } as IDownloadSpeedTestState
            },
            merge: (persistedState: any, currentState) => deepmerge(currentState, persistedState)
        }
    )
)

export default useDownloadSpeedTestStore