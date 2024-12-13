export const SPEEDTEST_ASSET_ROOT = "speedtest"
export const SPEEDTEST_ASSET_INDEX = "asset-index.json"

export interface IAssetDefinition {
    relative_path: string
    expected_payload_bytes?: number
}

export interface IAssetIndex {
    assets: IAssetDefinition[]
}

export function getPathToAsset(assetDefinition: IAssetDefinition) {
    return `/${SPEEDTEST_ASSET_ROOT}/${assetDefinition.relative_path}`
}

export async function getAssetIndex(): Promise<IAssetIndex> {
    return fetch(`/${SPEEDTEST_ASSET_ROOT}/${SPEEDTEST_ASSET_INDEX}`)
        .then(response => response.json())
        .then(json => json as IAssetIndex)
}