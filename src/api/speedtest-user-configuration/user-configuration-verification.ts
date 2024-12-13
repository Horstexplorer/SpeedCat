import {ISpeedtestUserConfiguration} from "./user-configuration.ts";
import {AssetConfiguration} from "../speedtest-assets/asset-configuration.ts";

export function validateMaxRequestConfiguration(value: number): boolean {
    return value > 0
}

export function validateMaxDurationConfiguration(value: number): boolean {
    return value > 0
}

export function validatePayloadByteSizeConfiguration(value: number, options: number[]): boolean {
    return value > 0 && options.includes(value)
}

export function validateUserConfiguration(assetsConfiguration: AssetConfiguration, userConfiguration: ISpeedtestUserConfiguration): boolean {
    return validateMaxRequestConfiguration(userConfiguration.latency.maxRequests)
        && validateMaxRequestConfiguration(userConfiguration.download.maxRequests)
        && validateMaxRequestConfiguration(userConfiguration.upload.maxRequests)
        && validateMaxDurationConfiguration(userConfiguration.latency.maxDuration)
        && validateMaxDurationConfiguration(userConfiguration.download.maxDuration)
        && validateMaxDurationConfiguration(userConfiguration.upload.maxDuration)
        && validatePayloadByteSizeConfiguration(userConfiguration.download.payloadByteSize, assetsConfiguration.getOrderedAvailablePayloadSizes())
        && validatePayloadByteSizeConfiguration(userConfiguration.upload.payloadByteSize, assetsConfiguration.getOrderedAvailablePayloadSizes())
}