import {create} from 'zustand'
import {createJSONStorage, persist} from "zustand/middleware"
import deepmerge from "deepmerge"
import {GaugeVisualScale} from "../../components/graphs/gauge/gauge-display.tsx";

export const UPDATE_INTERVAL_MS_OPTIONS = [100, 150, 200, 250, 500]

export interface IInterfaceState {
    updateIntervalMs: number
    gauge: {
        maxNumericValue: number
        scale: GaugeVisualScale
    }
}

export const interfaceStateDefaults: IInterfaceState = {
    updateIntervalMs: 150,
    gauge: {
        maxNumericValue: 1000,
        scale: GaugeVisualScale.LINEAR
    }
}

export interface IInterfaceStateActions {
    setUpdateInterval: (value: number) => void
    setGaugeMaxNumericValue: (value: number) => void
    setGaugeScale: (value: GaugeVisualScale) => void
}

export interface IInterfaceStoreControls {
    resetState: (state?: IInterfaceState) => void
}

export interface IInterfaceStore extends IInterfaceState {
    _actions: IInterfaceStateActions
    _ctrl: IInterfaceStoreControls
}

const useInterfaceStore = create<IInterfaceStore>()(
    persist(
        (set, get) => ({
            ...interfaceStateDefaults,
            _actions: {
                setUpdateInterval: value => set({...get(), updateIntervalMs: value}),
                setGaugeMaxNumericValue: value => set({...get(), gauge: {...get().gauge, maxNumericValue: value}}),
                setGaugeScale: value => set({...get(), gauge: {...get().gauge, scale: value}})
            },
            _ctrl: {
                resetState: state => {
                    set({...get(), ...state ?? interfaceStateDefaults})
                }
            }
        }),
        {
            name: "interface-state",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => {
                return {
                    updateIntervalMs: state.updateIntervalMs,
                    gauge: {
                        maxNumericValue: state.gauge.maxNumericValue,
                        scale: state.gauge.scale
                    }
                } as IInterfaceState
            },
            merge: (persistedState: any, currentState) => deepmerge(currentState, persistedState)
        }
    )
)

export default useInterfaceStore