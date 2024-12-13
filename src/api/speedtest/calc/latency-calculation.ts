import LatencyRequestManager, {
    ILatencyStateChangeEvent,
    LatencyRequestMethod, LatencyRequestState, LatencyStateChangeEventCallback,
} from "../requests/latency-request.ts";
import {Callback} from "../../misc/callback.ts";
import {ACalculation, ICalculationCallbacks, ICalculationConfiguration, ICalculationResult} from "./calculation.ts";

export interface ILatencyCalculationConfiguration extends ICalculationConfiguration {
    method: LatencyRequestMethod
    url: string
    parameters: {
        maxDuration: number
        maxRequests: number
    }
}

export interface ILatencyMeasurement {
    success: boolean
    latency: number
}

export type LatencyMeasurementCallback = Callback<ILatencyMeasurement>

export interface ILatencyCalculationResult extends ILatencyMeasurement, ICalculationResult {
    jitter: number
    samples: number
}

export type LatencyCalculationResultCallback = Callback<ILatencyCalculationResult>

export interface ILatencyCalculationCallbacks extends ICalculationCallbacks {
    stateChangeCallbacks?: LatencyStateChangeEventCallback[]
    measurementCallbacks?: LatencyMeasurementCallback[]
    resultCallbacks?: LatencyCalculationResultCallback[]
}

export function withDefaults(callbacks?: ILatencyCalculationCallbacks, message?: string): ILatencyCalculationCallbacks {
    const copy: ILatencyCalculationCallbacks = callbacks ? {...callbacks} : {}
    if (!copy.measurementCallbacks)
        copy.measurementCallbacks = []
    copy.measurementCallbacks?.push((delta) => { console.debug(message, `${delta.latency }ms `,delta) })
    if (!copy.resultCallbacks)
        copy.resultCallbacks = []
    copy.resultCallbacks.push((result) => { console.debug(message, `${result.latency} ms +-${result.jitter} ms`, result) })
    return copy
}

export default class LatencyCalculation extends ACalculation<ILatencyCalculationConfiguration, ILatencyCalculationCallbacks, ILatencyCalculationResult> {

    constructor(configuration: ILatencyCalculationConfiguration) {
        super(configuration)
    }

    protected measurementFrom(events: ILatencyStateChangeEvent[]): ILatencyMeasurement {
        function toMeasurement(success: boolean, latency: number): ILatencyMeasurement {
            return {
                success: success,
                latency: latency
            }
        }

        const start = events
            .find(event => event.state === LatencyRequestState.STARTED)
        const end = events
            .find(event => event.state === LatencyRequestState.COMPLETED)
        const error = events
            .find(event => event.state === LatencyRequestState.FAILURE)

        if (start && end)
            return toMeasurement(!!error, +(end.timestamp - start.timestamp).toFixed(2))
        return toMeasurement(false, -1)
    }

    protected resultFrom(measurements: ILatencyMeasurement[]): ILatencyCalculationResult {
        function toResult(success: boolean, latency: number, jitter: number, samples: number) {
            return {
                success: success,
                latency: latency,
                jitter: jitter,
                samples: samples
            }
        }

        const filtered = measurements.filter(measurement => !measurement.success)
        if (filtered.length < 2)
            return toResult(true, filtered[0].latency, 0, 1)
        const averageLatency = measurements.map(result => result.latency)
            .reduce((previous, current) => previous + current) / filtered.length
        const averageJitter = filtered.slice(1)
            .map((v, i) => Math.abs(v.latency - filtered[i].latency))
            .reduce((p, k) => p + k) / filtered.length

        return toResult(filtered.length == measurements.length, +averageLatency.toFixed(2), +averageJitter.toFixed(2), filtered.length)
    }

    override async calculate(callbacks?: ILatencyCalculationCallbacks): Promise<ILatencyCalculationResult> {
        const requestManager = new LatencyRequestManager()
        let iterationCount: number = 0
        let lastIterationDuration: number = 0
        const measurements: ILatencyMeasurement[] = []
        const startTime: number = window.performance.now()

        const continueIteration: () => boolean = () =>
            (this.configuration.parameters.maxRequests > 0 && iterationCount < this.configuration.parameters.maxRequests) // max iterations not reached
            && ((window.performance.now() - startTime) + lastIterationDuration < this.configuration.parameters.maxDuration) // timeout unlikely
        const remainingUntilTimeout: () => number = () =>
            this.configuration.parameters.maxDuration - ((window.performance.now() - startTime) + lastIterationDuration)

        while (continueIteration()) {
            iterationCount++
            const iterationStartTime = window.performance.now()
            const latencyEvents = await requestManager.performLatencyRequest({
                method: this.configuration.method,
                url: this.configuration.url,
                timeout: remainingUntilTimeout()
            }, (event: ILatencyStateChangeEvent) => {
                if (callbacks?.stateChangeCallbacks)
                    callbacks?.stateChangeCallbacks.forEach(callback => callback(event))
            })
            const measurement = this.measurementFrom(latencyEvents)
            measurements.push(measurement)
            if (callbacks?.measurementCallbacks)
                callbacks?.measurementCallbacks.forEach(callback => callback(measurement))
            lastIterationDuration = window.performance.now() - iterationStartTime
        }

        const result = this.resultFrom(measurements)
        if (callbacks?.resultCallbacks)
            callbacks?.resultCallbacks.forEach(callback => callback(result))
        return new Promise((resolve) => {
            resolve(result)
        })
    }

}