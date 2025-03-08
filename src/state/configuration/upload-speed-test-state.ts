import {create} from "zustand/index"
import {createJSONStorage, persist} from "zustand/middleware"
import deepmerge from "deepmerge"
import {DataUnit, DataUnits} from "../../api/misc/units/types/data-units.ts"
import Value from "../../api/misc/units/value.ts"
import useTestFileConfigurationStore from "./test-file-configuration-state.ts"
import {ITestFileDefinition} from "../../api/test-files/test-file-definition.ts";

export interface IUploadSpeedTestState {
    enabled: boolean
    payloadSize?: Value<DataUnit>
    parameters: {
        minDelay: number
        maxDuration: number
        maxRequests: number
    }
}

export const uploadSpeedTestStateDefaults: IUploadSpeedTestState = {
    enabled: true,
    payloadSize: undefined,
    parameters: {
        minDelay: 0,
        maxDuration: 30_000,
        maxRequests: 100
    }
}

export interface IUploadSpeedTestStateActions {
    setEnabled: (enabled: boolean) => void
    setPayloadSize: (value: Value<DataUnit>) => void
    setParameters: (minDelay: number | undefined, maxDuration: number | undefined, maxRequests: number | undefined) => void
    resolveTestFileDefinition: () => ITestFileDefinition | undefined
}

export interface IUploadSpeedTestStoreControls {
    readyToBeUsed: boolean
    bootstrap: () => Promise<void>
    resetState: (state?: IUploadSpeedTestState) => void
}

export interface IUploadSpeedTestStore extends IUploadSpeedTestState {
    _actions: IUploadSpeedTestStateActions
    _ctrl: IUploadSpeedTestStoreControls
}

const useUploadSpeedTestStore = create<IUploadSpeedTestStore>()(
    persist(
        (set, get) => ({
            ...uploadSpeedTestStateDefaults,
            _actions: {
                setEnabled: value => set({...get(), enabled: value}),
                setPayloadSize: value => set({...get(), payloadSize: value}),
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
                    if (!currentState._ctrl.readyToBeUsed)
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
                    const assetConfig = testFileStoreState.testFileConfiguration!

                    if (!currentState.payloadSize) {
                        const asset = assetConfig.dataDefinitions
                            .find(definition => definition.flags?.selectable && definition.flags.default)
                        const size = new Value(asset!.byteSize!, DataUnits.BYTE)
                        set({...get(), payloadSize: size})
                        return currentState._ctrl.bootstrap()
                    } else {
                        const byteSize = Value.convert(currentState.payloadSize, DataUnits.BYTE).value
                        const asset = assetConfig.dataDefinitions
                            .find(definition => definition.flags?.selectable && definition.byteSize == byteSize)
                        if (!asset) {
                            currentState._ctrl.resetState()
                            return currentState._ctrl.bootstrap()
                        }
                    }

                    set({...get(), _ctrl: {...get()._ctrl, readyToBeUsed: true}})
                },
                resetState: state => {
                    const defaults = state || uploadSpeedTestStateDefaults
                    set({...get(), ...defaults, _ctrl: {...get()._ctrl, readyToBeUsed: false}})
                }
            }
        }),
        {
            name: "upload-speed-test-state",
            storage: createJSONStorage(() => localStorage, {
                reviver: (key, value) => {
                    if (key == 'payloadSize' && value) {
                        const valueJson = value as {value: number, uid: string}
                        const dataValue = new Value(valueJson.value, DataUnits.values().find(unit => unit.uid == valueJson.uid)!)
                        return Value.convert(dataValue, DataUnits.BYTE)
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
                    enabled: state.enabled,
                    payloadSize: state.payloadSize,
                    parameters: {
                        minDelay: state.parameters.minDelay,
                        maxDuration: state.parameters.maxDuration,
                        maxRequests: state.parameters.maxRequests
                    }
                } as IUploadSpeedTestState
            },
            merge: (persistedState: any, currentState) => deepmerge(currentState, persistedState)
        }
    )
)

export default useUploadSpeedTestStore