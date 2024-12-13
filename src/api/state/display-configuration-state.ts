import {create} from 'zustand'
import {persist} from "zustand/middleware";
import {DataUnit} from "../misc/data-unit-conversion.ts";

export interface IDisplayConfigurationState {
    useSIUnits: boolean,
    setUseSIUnits: (value: boolean) => void
    useByteUnits: boolean,
    setUseByteUnits: (value: boolean) => void
    useFixedUnit?: DataUnit
    setUseFixedUnit: (value?: DataUnit) => void
}

const useDisplayConfigurationStore = create<IDisplayConfigurationState>()(
    persist(
        (set, get) => ({
            useSIUnits: false,
            setUseSIUnits: value => set({...get(), useSIUnits: value, useFixedUnit: undefined}),
            useByteUnits: true,
            setUseByteUnits: value => set({...get(), useByteUnits: value, useFixedUnit: undefined}),

            setUseFixedUnit: value => set({...get(), useFixedUnit: value}),
        }),
        {name: 'display-configuration-state'}
    )
)

export default useDisplayConfigurationStore