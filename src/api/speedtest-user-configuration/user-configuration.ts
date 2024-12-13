import {IRequestCountLimitConfig, IRequestDurationLimitConfig} from "../speedtest/config/speedtest-configuration.ts";

export interface IPayloadByteSize {
    payloadByteSize: number
}

export interface ISpeedtestUserConfiguration {
    latency: IRequestCountLimitConfig
        & IRequestDurationLimitConfig,
    download: IPayloadByteSize
        & IRequestCountLimitConfig
        & IRequestDurationLimitConfig
    upload: IPayloadByteSize
        & IRequestCountLimitConfig
        & IRequestDurationLimitConfig
} 