import {
    getAssetIndex,
    IAssetDefinition,
    IAssetIndex
} from "./asset-index.ts";

export class AssetConfiguration {

    private index: IAssetIndex

    constructor(index: IAssetIndex) {
        this.index = index
    }

    get assetWithNoPayload(): IAssetDefinition | undefined {
        return this.index.assets
            .find(asset => !asset.expected_payload_bytes || asset.expected_payload_bytes == 0)
    }

    get assetsWithPayload(): IAssetDefinition[] {
        return this.index.assets
            .filter(asset => asset.expected_payload_bytes && asset.expected_payload_bytes > 0)
    }

    assetWithPayloadCloseTo(size: number, allowedDeviation: number = 1): IAssetDefinition | undefined {
        const closestMatch = this.assetsWithPayload
            .sort((first, second) => first.expected_payload_bytes! - second.expected_payload_bytes!)
            .reduce(function (pre, cur) {
                return (Math.abs(cur.expected_payload_bytes! - size) < Math.abs(pre.expected_payload_bytes! - size) ? cur : pre)
            })
        if (!closestMatch
            || (size > 0 && (Math.abs(closestMatch.expected_payload_bytes! - size)/size) > allowedDeviation))
            return undefined
        return closestMatch
    }

    getOrderedAvailablePayloadSizes(): number[] {
        return this.assetsWithPayload
            .map(asset => asset.expected_payload_bytes!)
            .sort((first, second) => first - second)
    }

}

export async function fetchAssetConfiguration(): Promise<AssetConfiguration> {
    const assetIndex = await getAssetIndex()
    return new AssetConfiguration(assetIndex)
}