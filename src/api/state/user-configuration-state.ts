import {create} from 'zustand'
import {ISpeedtestUserConfiguration} from "../speedtest-user-configuration/user-configuration.ts";
import {persist} from "zustand/middleware";

export interface IUserConfigurationState {
    userConfiguration?: ISpeedtestUserConfiguration,
    saveUserConfiguration: (configuration: ISpeedtestUserConfiguration) => void
}

const useUserConfigurationStore = create<IUserConfigurationState>()(
    persist(
        (set, get) => ({
            saveUserConfiguration: configuration => set({...get(), userConfiguration: configuration}),
        }),
        {name: 'user-configuration-state'}
    )
)

export default useUserConfigurationStore