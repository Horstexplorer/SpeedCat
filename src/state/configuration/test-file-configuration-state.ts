import {create} from 'zustand'
import TestFileConfiguration, {getTestFileConfiguration} from "../../api/test-files/test-file-configuration.ts";

export interface ITestFileConfigurationState {
    testFileConfiguration?: TestFileConfiguration
}

export interface ITestFileConfigurationStateActions {
    setTestFileConfiguration: (testFileConfiguration: TestFileConfiguration) => void
}

export interface ITestFileConfigurationStoreControls {
    readyToBeUsed: boolean
    bootstrap: () => Promise<void>
}

export interface ITestFileConfigurationStore extends ITestFileConfigurationState {
    _actions: ITestFileConfigurationStateActions
    _ctrl: ITestFileConfigurationStoreControls
}

const useTestFileConfigurationStore = create<ITestFileConfigurationStore>()((set, get) => ({
    _actions: {
        setTestFileConfiguration: value => set({...get(), testFileConfiguration: value})
    },
    _ctrl: {
        readyToBeUsed: false,
        bootstrap: async () => {
            const currentState = get()
            if (currentState._ctrl.readyToBeUsed)
                return
            if (!currentState.testFileConfiguration){
                currentState._actions.setTestFileConfiguration(await getTestFileConfiguration())
                return currentState._ctrl.bootstrap()
            }

            set({...get(), _ctrl: {...get()._ctrl, readyToBeUsed: true}})
        }
    }
}))

export default useTestFileConfigurationStore