import {
    getAssetIndex,
    IAssetDefinition,
    IAssetIndex
} from "./asset-index.ts"
import Value from "../misc/units/value.ts"
import {DataUnit, DataUnits} from "../misc/units/types/data-units.ts"

export default class AssetConfiguration {

    private index: IAssetIndex

    constructor(index: IAssetIndex) {
        this.index = index
    }

    get assetsWithNoPayload(): IAssetDefinition[] {
        return this.index.assets
            .filter(asset => !asset.expected_payload_bytes || asset.expected_payload_bytes == 0)
    }

    get assetsWithPayload(): IAssetDefinition[] {
        return this.index.assets
            .filter(asset => asset.expected_payload_bytes && asset.expected_payload_bytes > 0)
            .sort((first, second) => (first.expected_payload_bytes || 0) - (second.expected_payload_bytes || 0))
    }

    assetWithPayloadCloseTo(size: Value<DataUnit>, allowedDeviation: number = 1): IAssetDefinition | undefined {
        const byteSize = Value.convert(size, DataUnits.BYTE).value
        const closestMatch = this.assetsWithPayload
            .reduce(function (pre, cur) {
                return (Math.abs(cur.expected_payload_bytes! - byteSize) < Math.abs(pre.expected_payload_bytes! - byteSize) ? cur : pre)
            })
        if (!closestMatch
            || (byteSize > 0 && (Math.abs(closestMatch.expected_payload_bytes! - byteSize)/byteSize) > allowedDeviation))
            return undefined
        return closestMatch
    }

    get availablePayloadSizes(): Value<DataUnit>[] {
        return this.assetsWithPayload
            .map(asset => asset.expected_payload_bytes!)
            .map(value => new Value(value, DataUnits.BYTE))
    }

}

export async function fetchAssetConfiguration(): Promise<AssetConfiguration> {
    const assetIndex = await getAssetIndex()
    return new AssetConfiguration(assetIndex)
}