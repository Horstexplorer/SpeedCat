import {create} from 'zustand'
import AssetConfiguration, {fetchAssetConfiguration} from "../../api/test-files/asset-configuration.ts"

export interface IAssetConfigurationState {
    assetConfiguration?: AssetConfiguration
}

export interface IAssetConfigurationStateActions {
    setAssetConfiguration: (assetConfiguration?: AssetConfiguration) => void
}

export interface IAssetConfigurationStoreControls {
    readyToBeUsed: boolean
    bootstrap: () => Promise<void>
}

export interface IAssetConfigurationStore extends IAssetConfigurationState {
    _actions: IAssetConfigurationStateActions
    _ctrl: IAssetConfigurationStoreControls
}

const useAssetConfigurationStore = create<IAssetConfigurationStore>()((set, get) => ({
    _actions: {
        setAssetConfiguration: value => set({...get(), assetConfiguration: value})
    },
    _ctrl: {
        readyToBeUsed: false,
        bootstrap: async () => {
            const currentState = get()
            if (currentState._ctrl.readyToBeUsed)
                return
            if (!currentState.assetConfiguration)
                get()._actions.setAssetConfiguration(await fetchAssetConfiguration())
            set({...get(), _ctrl: {...get()._ctrl, readyToBeUsed: true}})
        }
    }
}))

export default useAssetConfigurationStore