import {create} from 'zustand'
import {createJSONStorage, persist} from "zustand/middleware"
import deepmerge from "deepmerge"

export const UPDATE_INTERVAL_MS_OPTIONS = [100, 150, 200, 250, 500]

export interface IInterfaceState {
    updateIntervalMs: number
}

export const interfaceStateDefaults: IInterfaceState = {
    updateIntervalMs: 150
}

export interface IInterfaceStateActions {
    setUpdateInterval: (ms: number) => void
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
                setUpdateInterval: value => set({...get(), updateIntervalMs: value})
            },
            _ctrl: {
                resetState: state => {
                    set({...get(), ...state ?? interfaceStateDefaults})
                }
            }
        }),
        {
            name: "data-unit-state",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => {
                return {
                    updateIntervalMs: state.updateIntervalMs
                } as IInterfaceState
            },
            merge: (persistedState: any, currentState) => deepmerge(currentState, persistedState)
        }
    )
)

export default useInterfaceStore