import LatencyCalculation, {ILatencyCalculationCallbacks, withDefaults as withLatencyDefaults} from "./calc/latency-calculation.ts";
import SpeedCalculation, {ISpeedCalculationCallbacks, withDefaults as withSpeedDefaults} from "./calc/speed-calculation.ts";
import {LatencyRequestMethod} from "./requests/latency-request.ts";
import {SpeedRequestMethod} from "./requests/speed-request.ts";
import {ISpeedtestConfiguration} from "./config/speedtest-configuration.ts";

export interface ISpeedtestCallbacks {
    latency?: ILatencyCalculationCallbacks
    download?: ISpeedCalculationCallbacks
    upload?: ISpeedCalculationCallbacks
}

export function withDefaults(callbacks?: ISpeedtestCallbacks) : ISpeedtestCallbacks {
    const copy: ISpeedtestCallbacks = callbacks ? {...callbacks} : {}
    copy.latency = withLatencyDefaults(copy.latency, "Latency")
    copy.download = withSpeedDefaults(copy.download, "Download")
    copy.upload = withSpeedDefaults(copy.upload, "Upload")
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


    async runLatencyTest(callbacks?: ILatencyCalculationCallbacks) {
        const latencyCalculator = new LatencyCalculation({
            method: LatencyRequestMethod.PREFLIGHT,
            url: this.configuration.latency.url,
            parameters: {
                maxDuration: this.configuration.latency.maxDuration,
                maxRequests: this.configuration.latency.maxRequests
            }
        })
        return latencyCalculator.calculate(callbacks)
    }

    async runDownloadTest(callbacks?: ISpeedCalculationCallbacks) {
        const speedCalculator = new SpeedCalculation({
            method: SpeedRequestMethod.DOWNLOAD,
            url: this.configuration.download.url,
            parameters: {
                maxDuration: this.configuration.download.maxDuration,
                maxRequests: this.configuration.download.maxRequests
            }
        })
        return speedCalculator.calculate(callbacks)
    }

    async runUploadTest(callbacks?: ISpeedCalculationCallbacks) {
        const speedCalculator = new SpeedCalculation({
            method: SpeedRequestMethod.UPLOAD,
            url: this.configuration.upload.url,
            payload: this.configuration.upload.payloadProvider(),
            parameters: {
                maxDuration: this.configuration.upload.maxDuration,
                maxRequests: this.configuration.upload.maxRequests
            }
        })
        return speedCalculator.calculate(callbacks)
    }

}