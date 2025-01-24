import {create} from 'zustand'
import {ISpeedtestUserConfiguration} from "../speedtest-user-configuration/user-configuration.ts";
import {persist} from "zustand/middleware";

export interface IUserConfigurationState {
    userTestConfiguration?: ISpeedtestUserConfiguration,
    saveUserTestConfiguration: (configuration: ISpeedtestUserConfiguration) => void
}

const useUserConfigurationStore = create<IUserConfigurationState>()(
    persist(
        (set, get) => ({
            saveUserTestConfiguration: configuration => set({...get(), userTestConfiguration: configuration}),
        }),
        {name: 'user-configuration-state'}
    )
)

export default useUserConfigurationStore