import {create} from 'zustand'
import {createJSONStorage, persist} from "zustand/middleware"
import {DataUnit, DataUnitBase, DataUnits, DataUnitType} from "../../api/misc/units/types/data-units.ts"
import deepmerge from "deepmerge"
import Value from "../../api/misc/units/value.ts";

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
    convert: (value: Value<DataUnit>) => Value<DataUnit>
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
                        .filter(dataUnit => dataUnit.base == value && dataUnit.type == get().type)
                        .find(dataUnit => dataUnit.exponent == get().unit?.exponent)
                    console.log(value, newUnit, get().unit?.exponent)
                    set({...get(), base: value, unit: newUnit})
                },
                setType: value => {
                    const newUnit = DataUnits.values()
                        .filter(dataUnit => dataUnit.base == get().base && dataUnit.type == value)
                        .find(dataUnit => dataUnit.exponent == get().unit?.exponent)
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
                convert: value => {
                    return Value.convert(value, get().unit!)
                }
            },
            _ctrl: {
                resetState: state => {
                    set({...get(), ...state ?? dataUnitStateDefaults})
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