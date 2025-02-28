import {create} from 'zustand'
import {createJSONStorage, persist} from "zustand/middleware"
import {DataUnit, DataUnitBase, DataUnits, DataUnitType} from "../../api/misc/units/types/data-units.ts"
import deepmerge from "deepmerge"

export interface IDataUnitState {
    base: DataUnitBase
    type: DataUnitType
    unit?: DataUnit
}

export const dataUnitStateDefaults: IDataUnitState = {
    base: DataUnitBase.BYTE,
    type: DataUnitType.BINARY,
    unit: DataUnits.MEBI_BYTE
}

export interface IDataUnitStateActions {
    setBase: (value: DataUnitBase) => void
    setType: (value: DataUnitType) => void
    setUnit: (value?: DataUnit) => void
}

export interface IDataUnitStoreControls {
    resetState: (state?: IDataUnitState) => void
}

export interface IDataUnitStore extends IDataUnitState {
    _actions: IDataUnitStateActions
    _ctrl: IDataUnitStoreControls
}

const useDataUnitStore = create<IDataUnitStore>()(
    persist(
        (set, get) => ({
            ...dataUnitStateDefaults,
            _actions: {
                setBase: value => {
                    const newUnit = DataUnits.values()
                        .find(dataUnit => get().unit
                            && dataUnit.type == get().type
                            && dataUnit.base == value
                            && dataUnit.exponent == get().unit?.exponent)
                    set({...get(), base: value, unit: newUnit})
                },
                setType: value => {
                    const newUnit = DataUnits.values()
                        .find(dataUnit => get().unit
                            && dataUnit.type == value
                            && dataUnit.base == get().base
                            && dataUnit.exponent == get().unit?.exponent)
                    set({...get(), type: value, unit: newUnit})
                },
                setUnit: value => {
                    set({
                        ...get(),
                        base: value ? value.base : get().base,
                        type: value ? value.type : get().type,
                        unit: value
                    })
                },
            },
            _ctrl: {
                resetState: state => {
                    const defaults = state || dataUnitStateDefaults
                    set({...get(), ...defaults})
                }
            }
        }),
        {
            name: "data-unit-state",
            storage: createJSONStorage(() => localStorage, {
                reviver: (key, value) => {
                    if (key == 'unit' && value)
                        return DataUnits.values().find(dataUnit => dataUnit.uid == value)
                    return value
                },
                replacer: (_, value) => {
                    if (value instanceof DataUnit)
                        return value.uid
                    return value
                }
            }),
            partialize: (state) => {
                return {
                    base: state.base,
                    type: state.type,
                    unit: state.unit
                } as IDataUnitState
            },
            merge: (persistedState: any, currentState) => deepmerge(currentState, persistedState)
        }
    )
)

export default useDataUnitStore