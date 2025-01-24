import {IRequestCountLimitConfig, IRequestDurationLimitConfig} from "../speedtest/config/speedtest-configuration.ts";

export interface IEnabled {
    enabled: boolean
}

export interface IPayloadByteSize {
    payloadByteSize: number
}

export interface IValueFormattedDisplay {
    useSIUnits: boolean,
    useByteUnits: boolean,
    useFixedUnit?: string
}

export interface ISpeedtestUserConfiguration {
    display: IValueFormattedDisplay
    latency: IEnabled
        & IRequestCountLimitConfig
        & IRequestDurationLimitConfig,
    download: IEnabled
        & IPayloadByteSize
        & IRequestCountLimitConfig
        & IRequestDurationLimitConfig
    upload: IEnabled
        & IPayloadByteSize
        & IRequestCountLimitConfig
        & IRequestDurationLimitConfig
} 