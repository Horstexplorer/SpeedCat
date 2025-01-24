import {RequestPayload} from "../../misc/http-request.ts";

export interface IURlConfig {
    url: string
}

export interface IRequestPayloadProviderConfig {
    payloadProvider: () => RequestPayload
}

export interface IRequestCountLimitConfig {
    maxRequests: number
}

export interface IRequestDurationLimitConfig {
    maxDuration: number
}

export interface ISpeedtestConfiguration {
    latency: IURlConfig
        & IRequestCountLimitConfig
        & IRequestDurationLimitConfig,
    download: IURlConfig
        & IRequestCountLimitConfig
        & IRequestDurationLimitConfig,
    upload: IURlConfig
        & IRequestCountLimitConfig
        & IRequestDurationLimitConfig
        & IRequestPayloadProviderConfig,
}