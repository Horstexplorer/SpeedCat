import {ISpeedtestConfiguration} from "../speedtest/config/speedtest-configuration.ts";
import {generateRandomData} from "../misc/generator.ts";
import {AssetConfiguration} from "../speedtest-assets/asset-configuration.ts";
import {getPathToAsset} from "../speedtest-assets/asset-index.ts";
import {
    validateMaxDurationConfiguration,
    validateMaxRequestConfiguration, validatePayloadByteSizeConfiguration, validateUserConfiguration
} from "./user-configuration-verification.ts";
import {ISpeedtestUserConfiguration} from "./user-configuration.ts";

export function buildSpeedtestConfigurationFrom(assetConfiguration: AssetConfiguration, persisted: ISpeedtestUserConfiguration): ISpeedtestConfiguration {
    const noPayloadAsset = assetConfiguration.assetWithNoPayload!
    const downloadAsset = assetConfiguration.assetWithPayloadCloseTo(persisted.download.payloadByteSize)!
    return {
        latency: {
            url: getPathToAsset(noPayloadAsset),
            maxRequests: persisted.latency.maxRequests,
            maxDuration: persisted.latency.maxDuration
        },
        download: {
            url: getPathToAsset(downloadAsset),
            maxRequests: persisted.download.maxRequests,
            maxDuration: persisted.download.maxDuration
        },
        upload: {
            url: getPathToAsset(noPayloadAsset),
            maxRequests: persisted.upload.maxRequests,
            maxDuration: persisted.upload.maxDuration,
            payloadProvider: () => new Blob([generateRandomData(persisted.upload.payloadByteSize)], { type: "application/octet-stream"})
        }
    }
}

export function buildDefaultSpeedtestUserConfiguration(assetConfiguration: AssetConfiguration): ISpeedtestUserConfiguration {
    const payloadAsset = assetConfiguration.assetWithPayloadCloseTo(0)!
    return {
        latency: {
            maxRequests: 10,
            maxDuration: 3_000
        },
        download: {
            payloadByteSize: payloadAsset.expected_payload_bytes!,
            maxRequests: 25,
            maxDuration: 15_000
        },
        upload: {
            payloadByteSize: payloadAsset.expected_payload_bytes!,
            maxRequests: 25,
            maxDuration: 15_000,
        }
    }
}

export interface IMaxRequestConfiguration {
    setMaxRequests: (value: number) => boolean
}

export interface IMaxDurationConfiguration {
    setMaxDuration: (value: number) => boolean
}

export interface IPayloadByteSizeConfiguration {
    setPayloadByteSize: (value: number) => boolean
}

export default class UserConfigurationBuilder {

    readonly assetConfiguration: AssetConfiguration
    configuration: ISpeedtestUserConfiguration

    constructor(assetsConfiguration: AssetConfiguration, userConfiguration?: ISpeedtestUserConfiguration, copy: boolean = true) {
        this.assetConfiguration = assetsConfiguration
        if (userConfiguration) {
            if (copy) {
                this.configuration = JSON.parse(JSON.stringify(userConfiguration))
            } else {
                this.configuration = userConfiguration
            }
        } else {
            this.configuration = buildDefaultSpeedtestUserConfiguration(this.assetConfiguration)
        }
    }

    get speedtestConfiguration(): ISpeedtestConfiguration {
        return buildSpeedtestConfigurationFrom(this.assetConfiguration, this.configuration)
    }

    toDefaults() {
        this.configuration = buildDefaultSpeedtestUserConfiguration(this.assetConfiguration)
    }

    validate(): boolean {
        return validateUserConfiguration(this.assetConfiguration, this.configuration)
    }

    get latencyConfigurator(): IMaxRequestConfiguration & IMaxDurationConfiguration {
        return {
            setMaxRequests: (value: number) => {
                if (validateMaxRequestConfiguration(value)) {
                    this.configuration.latency.maxRequests = value
                    return true
                }
                return false
            },
            setMaxDuration: (value: number) => {
                if (validateMaxDurationConfiguration(value)) {
                    this.configuration.latency.maxDuration = value
                    return true
                }
                return false
            }
        }
    }

    get downloadConfigurator():IPayloadByteSizeConfiguration & IMaxRequestConfiguration & IMaxDurationConfiguration {
        return {
            setPayloadByteSize: (value: number) => {
                if (validatePayloadByteSizeConfiguration(value, this.assetConfiguration.getOrderedAvailablePayloadSizes())) {
                    this.configuration.download.payloadByteSize = value
                    return true
                }
                return false
            },
            setMaxRequests: (value: number) => {
                if (validateMaxRequestConfiguration(value)) {
                    this.configuration.download.maxRequests = value
                    return true
                }
                return false
            },
            setMaxDuration: (value: number) => {
                if (validateMaxDurationConfiguration(value)) {
                    this.configuration.download.maxDuration = value
                    return true
                }
                return false
            }
        }
    }

    get uploadConfigurator():IPayloadByteSizeConfiguration & IMaxRequestConfiguration & IMaxDurationConfiguration {
        return {
            setPayloadByteSize: (value: number) => {
                if (validatePayloadByteSizeConfiguration(value, this.assetConfiguration.getOrderedAvailablePayloadSizes())) {
                    this.configuration.upload.payloadByteSize = value
                    return true
                }
                return false
            },
            setMaxRequests: (value: number) => {
                if (validateMaxRequestConfiguration(value)) {
                    this.configuration.upload.maxRequests = value
                    return true
                }
                return false
            },
            setMaxDuration: (value: number) => {
                if (validateMaxDurationConfiguration(value)) {
                    this.configuration.upload.maxDuration = value
                    return true
                }
                return false
            }
        }
    }
}