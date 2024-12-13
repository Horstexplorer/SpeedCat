import {create} from 'zustand'
import {AssetConfiguration} from "../speedtest-assets/asset-configuration.ts";

export interface IAssetConfigurationState {
    assetConfiguration?: AssetConfiguration
    setAssetConfiguration: (config: AssetConfiguration) => void
}

const useAssetConfigurationStore = create<IAssetConfigurationState>()((set, get) => ({
    setAssetConfiguration: configuration => set({...get(), assetConfiguration: configuration}),
}))

export default useAssetConfigurationStore