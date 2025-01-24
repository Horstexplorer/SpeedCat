import LatencyCalculation, {
    ILatencyCalculationCallbacks,
    ILatencyCalculationConfiguration, ILatencyCalculationResult,
    withDefaults as withLatencyDefaults
} from "./calc/latency-calculation.ts";
import SpeedCalculation, {
    ISpeedCalculationCallbacks,
    ISpeedCalculationConfiguration, ISpeedCalculationResult,
    withDefaults as withSpeedDefaults
} from "./calc/speed-calculation.ts";
import {LatencyRequestMethod} from "./requests/latency-request.ts";
import {SpeedRequestMethod} from "./requests/speed-request.ts";
import {ISpeedtestConfiguration} from "./config/speedtest-configuration.ts";

export interface ISpeedtestConfigurableTestCallbacks<C, T, R> {
    preHook?: (configuration: C) => boolean
    test?: T
    postHook?: (result?: R) => any
}

type SpeedtestLatencyCallbackType = ISpeedtestConfigurableTestCallbacks<ILatencyCalculationConfiguration, ILatencyCalculationCallbacks, ILatencyCalculationResult>
type SpeedtestSpeedCallbackType = ISpeedtestConfigurableTestCallbacks<ISpeedCalculationConfiguration, ISpeedCalculationCallbacks, ISpeedCalculationResult>

export interface ISpeedtestCallbacks {
    latency?: SpeedtestLatencyCallbackType
    download?: SpeedtestSpeedCallbackType
    upload?: SpeedtestSpeedCallbackType
}

export function withDefaults(callbacks?: ISpeedtestCallbacks) : ISpeedtestCallbacks {
    const copy: ISpeedtestCallbacks = callbacks ? {...callbacks} : {}
    copy.latency = {...copy.latency, test: withLatencyDefaults(copy.latency?.test, "Latency")}
    copy.download = {...copy.download, test: withSpeedDefaults(copy.download?.test, "Download")}
    copy.upload = {...copy.upload, test: withSpeedDefaults(copy.upload?.test, "Upload")}
    return copy
}

export default class Speedtest {

    configuration: ISpeedtestConfiguration
    callbacks?: ISpeedtestCallbacks

    constructor(configuration: ISpeedtestConfiguration, callbacks?: ISpeedtestCallbacks) {
        this.configuration = configuration
        this.callbacks = callbacks ? callbacks : withDefaults()
    }

    async runTestSuit(callbacks?: ISpeedtestCallbacks) {
        if (!callbacks && this.callbacks)
            callbacks = this.callbacks
        return new Promise<void>((resolve) => resolve())
            .then(() => this.runLatencyTest(callbacks?.latency))
            .then(() => this.runDownloadTest(callbacks?.download))
            .then(() => this.runUploadTest(callbacks?.upload))
            .then(() => {})
    }


    async runLatencyTest(callbacks?: SpeedtestLatencyCallbackType): Promise<ILatencyCalculationResult | undefined> {
        return new Promise<void>((resolve) => resolve())
            .then(() => {
                const configuration: ILatencyCalculationConfiguration = {
                    method: LatencyRequestMethod.PREFLIGHT,
                    url: this.configuration.latency.url,
                    parameters: {
                        maxDuration: this.configuration.latency.maxDuration,
                        maxRequests: this.configuration.latency.maxRequests
                    }
                }
                if (callbacks?.preHook && !callbacks.preHook(configuration))
                    return undefined;
                return new LatencyCalculation(configuration).calculate(callbacks?.test)
            })
            .then(result => {
                if (callbacks?.postHook)
                    callbacks.postHook(result)
                return result
            })
    }

    async runDownloadTest(callbacks?: SpeedtestSpeedCallbackType) {
        return new Promise<void>((resolve) => resolve())
            .then(() => {
                const configuration: ISpeedCalculationConfiguration = {
                    method: SpeedRequestMethod.DOWNLOAD,
                    url: this.configuration.download.url,
                    parameters: {
                        maxDuration: this.configuration.download.maxDuration,
                        maxRequests: this.configuration.download.maxRequests
                    }
                }
                if (callbacks?.preHook && !callbacks.preHook(configuration))
                    return undefined;
                return new SpeedCalculation(configuration).calculate(callbacks?.test)
            })
            .then(result => {
                if (callbacks?.postHook)
                    callbacks.postHook(result)
                return result
            })
    }

    async runUploadTest(callbacks?: SpeedtestSpeedCallbackType) {
        return new Promise<void>((resolve) => resolve())
            .then(() => {
                const configuration: ISpeedCalculationConfiguration = {
                    method: SpeedRequestMethod.UPLOAD,
                    url: this.configuration.upload.url,
                    payload: this.configuration.upload.payloadProvider(),
                    parameters: {
                        maxDuration: this.configuration.upload.maxDuration,
                        maxRequests: this.configuration.upload.maxRequests
                    }
                }
                if (callbacks?.preHook && !callbacks.preHook(configuration))
                    return undefined;
                return new SpeedCalculation(configuration).calculate(callbacks?.test)
            })
            .then(result => {
                if (callbacks?.postHook)
                    callbacks.postHook(result)
                return result
            })
    }

}