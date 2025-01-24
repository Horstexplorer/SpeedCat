import SpeedRequestManager, {
    ISpeedStateChangeEvent, SpeedChangeEventCallback,
    SpeedRequestMethod,
    SpeedRequestState
} from "../requests/speed-request.ts";
import {RequestPayload} from "../../misc/http-request.ts";
import {ChangeCalculationBuffer} from "../../misc/buffer.ts";
import {Callback} from "../../misc/callback.ts";
import {ACalculation, ICalculationCallbacks, ICalculationConfiguration, ICalculationResult} from "./calculation.ts";

export interface ISpeedCalculationConfiguration extends ICalculationConfiguration {
    method: SpeedRequestMethod
    url: string
    payload?: RequestPayload
    parameters: {
        maxDuration: number
        maxRequests: number
    }
}

export interface ISpeedChangeDelta {
    deltaTime: number
    deltaBytes: number
    deltaBytesPerSecond: number
}

export type SpeedChangeDeltaCallback = Callback<ISpeedChangeDelta>

export interface ISpeedCalculationResult extends ICalculationResult {
    success: boolean
    samples: number
    averageBytesPerSecond: number
}

export type SpeedCalculationResultCallback = Callback<ISpeedCalculationResult>

export interface ISpeedCalculationCallbacks extends ICalculationCallbacks {
    measurementCallbacks?: SpeedChangeEventCallback[]
    deltaCalculationCallbacks?: SpeedChangeDeltaCallback[]
    resultCallbacks?: SpeedCalculationResultCallback[]
}

export function withDefaults(callbacks?: ISpeedCalculationCallbacks, message?: string): ISpeedCalculationCallbacks {
    const copy: ISpeedCalculationCallbacks = callbacks ? {...callbacks} : {}
    if (!copy.deltaCalculationCallbacks)
        copy.deltaCalculationCallbacks = []
    copy.deltaCalculationCallbacks?.push((delta) => console.debug(message, `${delta.deltaBytesPerSecond} Bytes/s`, delta))
    if (!copy.resultCallbacks)
        copy.resultCallbacks = []
    copy.resultCallbacks.push((result) =>  console.debug(message,`${result.averageBytesPerSecond} Bytes/s`, result))
    return copy
}

export default class SpeedCalculation extends ACalculation<ISpeedCalculationConfiguration, ISpeedCalculationCallbacks, ISpeedCalculationResult> {

    constructor(configuration: ISpeedCalculationConfiguration) {
        super(configuration)
    }

    protected calculateChangeDelta(previous: ISpeedStateChangeEvent | undefined, next: ISpeedStateChangeEvent): ISpeedChangeDelta {
        function toDelta(deltaTime: number, deltaBytes: number) {
            return {
                deltaTime: deltaTime,
                deltaBytes: deltaBytes,
                deltaBytesPerSecond: Math.round(((deltaBytes / deltaTime) * 1000))
            }
        }

        const previousBytes = previous?.transferredBytes ? previous?.transferredBytes : 0
        const nextBytes = next?.transferredBytes ? next?.transferredBytes : 0
        if (!previous || previousBytes > nextBytes)
            return toDelta(0, nextBytes)
        return toDelta(next.timestamp - previous.timestamp, nextBytes - previousBytes)
    }

    protected resultFrom(measurements: ISpeedChangeDelta[]): ISpeedCalculationResult {
        const averageBytesPerSecond = (measurements.length < 2)
            ? measurements[0].deltaBytesPerSecond
            : measurements
            .map(e => e.deltaBytesPerSecond)
            .reduce((previous, current) => previous + current) / measurements.length
        return {
            success: true,
            samples: measurements.length,
            averageBytesPerSecond: averageBytesPerSecond,
        }
    }

    async calculate(callbacks?: ISpeedCalculationCallbacks): Promise<ISpeedCalculationResult> {
        const measurements: ISpeedChangeDelta[] = []
        const requestManager = new SpeedRequestManager()
        let iterationCount: number = 0
        let lastIterationDuration: number = 0
        const startTime: number = window.performance.now()
        const calculationBuffer = new ChangeCalculationBuffer<ISpeedStateChangeEvent, ISpeedChangeDelta>(this.calculateChangeDelta)

        const continueIteration: () => boolean = () =>
            (this.configuration.parameters.maxRequests > 0 && iterationCount < this.configuration.parameters.maxRequests) // max iterations not reached
            && ((window.performance.now() - startTime) + lastIterationDuration < this.configuration.parameters.maxDuration) // timeout unlikely
        const remainingUntilTimeout: () => number = () =>
            this.configuration.parameters.maxDuration - ((window.performance.now() - startTime) + lastIterationDuration)

        while (continueIteration()) {
            iterationCount++
            const iterationStartTime = window.performance.now()

            await requestManager.performSpeedRequest({
                method: this.configuration.method,
                url: this.configuration.url,
                timeout: remainingUntilTimeout(),
                payload: this.configuration.payload
            }, (event: ISpeedStateChangeEvent) => {
                if (callbacks?.measurementCallbacks)
                    callbacks.measurementCallbacks.forEach(callback => callback(event))
                if (event.state !== SpeedRequestState.STARTED && event.state !== SpeedRequestState.PROGRESS)
                    return
                const speedEventDelta = calculationBuffer.calculate(event)
                if (speedEventDelta.deltaTime <= 0 || speedEventDelta.deltaBytes <= 0)
                    return
                measurements.push(speedEventDelta)
                if (callbacks?.deltaCalculationCallbacks)
                    callbacks.deltaCalculationCallbacks.forEach(callback => callback(speedEventDelta))
            })
            lastIterationDuration = window.performance.now() - iterationStartTime
        }

        const result = this.resultFrom(measurements)
        if (callbacks?.resultCallbacks)
            callbacks.resultCallbacks.forEach(callback => callback(result))
        return new Promise((resolve) => {
            resolve(result)
        })
    }

}