import {performHttpRequest} from "../misc/http/http-request.ts"
import Value from "../misc/units/value.ts"
import {DataUnit, DataUnits} from "../misc/units/types/data-units.ts"

export const ASSET_ROOT = "test-files"
export const ASSET_INDEX = "asset-index.json"

export interface IAssetDefinition {
    relative_path: string
    expected_payload_bytes?: number
}

export interface IAssetIndex {
    assets: IAssetDefinition[]
}

function getPathToAssetIndex(): string {
    return `/${ASSET_ROOT}/${ASSET_INDEX}`
}

export function getPathToAsset(assetDefinition: IAssetDefinition): string {
    return `/${ASSET_ROOT}/${assetDefinition.relative_path}`
}

export function getDataSizeOfAsset(assetDefinition: IAssetDefinition): Value<DataUnit> {
    return new Value(assetDefinition.expected_payload_bytes || 0, DataUnits.BYTE)
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