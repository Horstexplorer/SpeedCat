import {
    ACalculation,
    ICalculationConfiguration,
    ICalculationEventCallbacks,
    ICalculationResult
} from "./calculation.ts";
import performLatencyRequest, {
    ILatencyStateChangeEvent,
    LatencyRequestMethod, LatencyRequestState,
    LatencyStateChangeEventCallback
} from "../requests/latency-request.ts";
import {EventCallback, IEvent} from "../../misc/events/event.ts";
import {combineCallbacks} from "../../misc/events/callback.ts";
import {iterateTask} from "../../misc/iteration/iteration.ts";

export interface ILatencyCalculationConfiguration extends ICalculationConfiguration {
    method: LatencyRequestMethod
    url: string
    parameters: {
        minDelay: number
        maxDuration: number
        maxRequests: number
    }
}

export interface ILatencyMeasurement {
    success: boolean
    latency: number
}

export type ILatencyMeasurementEvent = ILatencyMeasurement & IEvent
export type LatencyMeasurementEventCallback = EventCallback<ILatencyMeasurementEvent>

function latencyMeasurementEvent(latencyMeasurement: ILatencyMeasurement, timestamp: number = window.performance.now()): ILatencyMeasurementEvent {
    return {
        timestamp: timestamp,
        ...latencyMeasurement
    }
}

export interface ILatencyCalculationResult extends ICalculationResult, ILatencyMeasurement {
    jitter: number
    samples: number
}

export type ILatencyCalculationResultEvent = ILatencyCalculationResult & IEvent
export type LatencyCalculationResultEventCallback = EventCallback<ILatencyCalculationResultEvent>

function latencyCalculationResultEvent(latencyCalculationResult: ILatencyCalculationResult, timestamp: number = window.performance.now()): ILatencyCalculationResultEvent {
    return {
        timestamp: timestamp,
        ...latencyCalculationResult
    }
}

export interface ILatencyCalculationCallbacks extends ICalculationEventCallbacks {
    stateChange?: LatencyStateChangeEventCallback
    measurement?: LatencyMeasurementEventCallback
    result?: LatencyCalculationResultEventCallback
}

export function defaultLatencyCalculationCallbacks(callbacks?: ILatencyCalculationCallbacks, message: string = "Latency") {
    const copy: ILatencyCalculationCallbacks = callbacks ? {...callbacks} : {}

    copy.measurement = combineCallbacks(
        callbacks?.measurement,
        delta => console.debug(message, `${delta.latency} ms `, delta))
    copy.result = combineCallbacks(
        callbacks?.result,
        result => console.debug(message, `${result.latency} ms +-${result.jitter} ms`, result)
    )

    return copy
}

function calculateLatencyMeasurement(events: ILatencyStateChangeEvent[]): ILatencyMeasurement {

    function latencyMeasurement(success: boolean, latency: number): ILatencyMeasurement {
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
        return latencyMeasurement(!!error, +(end.timestamp - start.timestamp).toFixed(2))
    return latencyMeasurement(false, -1)
}

function calculateLatencyCalculationResult(measurements: ILatencyMeasurement[]): ILatencyCalculationResult {

    function latencyCalculationResult(success: boolean, latency: number, jitter: number, samples: number) {
        return {
            success: success,
            latency: latency,
            jitter: jitter,
            samples: samples
        }
    }

    const filtered = measurements.filter(measurement => !measurement.success)
    if (filtered.length == 0)
        return latencyCalculationResult(false, -1, -1, 0)
    if (filtered.length < 2)
        return latencyCalculationResult(filtered[0].success, filtered[0].latency, 0, 1)
    const averageLatency = measurements.map(result => result.latency)
        .reduce((previous, current) => previous + current, 0) / filtered.length
    const averageJitter = filtered.slice(1)
        .map((v, i) => Math.abs(v.latency - filtered[i].latency))
        .reduce((p, k) => p + k, 0) / filtered.length

    return latencyCalculationResult(filtered.length == measurements.length, +averageLatency.toFixed(2), +averageJitter.toFixed(2), filtered.length)
}


export default class LatencyCalculation extends ACalculation<ILatencyCalculationConfiguration, ILatencyCalculationCallbacks, ILatencyCalculationResult> {

    constructor(configuration: ILatencyCalculationConfiguration) {
        super(configuration)
    }

    override async calculate(callbacks?: ILatencyCalculationCallbacks): Promise<ILatencyCalculationResult> {

        const latencyMeasurements = await iterateTask({
            maxIterations: this.configuration.parameters.maxRequests,
            timeoutAfterMs: this.configuration.parameters.maxDuration,
            iterationDelayMs: this.configuration.parameters.minDelay
        }, async details => {
            const latencyChangeEvents = await performLatencyRequest({
                method: this.configuration.method,
                url: this.configuration.url,
                timeout: details.timeout.remaining!
            }, (event: ILatencyStateChangeEvent) => {
                if (callbacks?.stateChange)
                    callbacks.stateChange(event)
            })
            const measurement = calculateLatencyMeasurement(latencyChangeEvents)
            if (callbacks?.measurement)
                callbacks.measurement(latencyMeasurementEvent(measurement))
            return measurement
        })

        const result = calculateLatencyCalculationResult(latencyMeasurements)
        if (callbacks?.result)
            callbacks.result(latencyCalculationResultEvent(result))

        return result
    }

}