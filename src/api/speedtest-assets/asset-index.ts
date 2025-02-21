import {performHttpRequest} from "../misc/http/http-request.ts";

export const SPEEDTEST_ASSET_ROOT = "speedtest"
export const SPEEDTEST_ASSET_INDEX = "asset-index.json"

export interface IAssetDefinition {
    relative_path: string
    expected_payload_bytes?: number
}

export interface IAssetIndex {
    assets: IAssetDefinition[]
}

function getPathToAssetIndex() {
    return `/${SPEEDTEST_ASSET_ROOT}/${SPEEDTEST_ASSET_INDEX}`
}

export function getPathToAsset(assetDefinition: IAssetDefinition) {
    return `/${SPEEDTEST_ASSET_ROOT}/${assetDefinition.relative_path}`
}

export async function getAssetIndex(): Promise<IAssetIndex> {
    const assetIndexResponse = await performHttpRequest({
        method: 'GET',
        url: getPathToAssetIndex(),
        settings: {
            responseType: "json"
        }
    })

    return assetIndexResponse.response as IAssetIndex
}