import performSpeedRequest, {
    ISpeedStateChangeEvent,
    SpeedChangeEventCallback,
    SpeedRequestMethod,
    SpeedRequestState
} from "../requests/speed-request.ts";
import {RequestPayload} from "../../misc/http/http-request.ts";
import {ChangeCalculationBuffer} from "../../misc/change-buffer.ts";
import {Callback} from "../../misc/callback.ts";
import {ACalculation, ICalculationCallbacks, ICalculationConfiguration, ICalculationResult} from "./calculation.ts";
import {DataUnit, DataUnitBase, DataUnits, DataUnitType} from "../../misc/units/types/data-units.ts";
import Value from "../../misc/units/value.ts";
import {iterateTask} from "../../misc/iteration/iteration.ts";

export interface ISpeedCalculationConfiguration extends ICalculationConfiguration {
    method: SpeedRequestMethod
    url: string
    payload?: RequestPayload
    parameters: {
        minDelay: number
        maxDuration: number
        maxRequests: number
    }
}

export interface ISpeedChangeDelta {
    deltaTime: number
    deltaData: Value<DataUnit>
    deltaDataPerSecond: Value<DataUnit>
}

export type SpeedChangeDeltaCallback = Callback<ISpeedChangeDelta>

export interface ISpeedCalculationResult extends ICalculationResult {
    samples: number
    averagePerSecond: Value<DataUnit>
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
    copy.deltaCalculationCallbacks?.push((delta) =>
        console.debug(message, `${DataUnits.fit(delta.deltaDataPerSecond, DataUnitType.SI, DataUnitBase.BYTE)}`, delta))
    if (!copy.resultCallbacks)
        copy.resultCallbacks = []
    copy.resultCallbacks.push((result) =>
        console.debug(message, `${DataUnits.fit(result.averagePerSecond, DataUnitType.SI, DataUnitBase.BYTE)}`, result))
    return copy
}

export default class SpeedCalculation extends ACalculation<ISpeedCalculationConfiguration, ISpeedCalculationCallbacks, ISpeedCalculationResult> {

    constructor(configuration: ISpeedCalculationConfiguration) {
        super(configuration)
    }

    protected calculateChangeDelta(previous: ISpeedStateChangeEvent | undefined, next: ISpeedStateChangeEvent): ISpeedChangeDelta {
        const previousData = previous?.transferredData ? previous.transferredData : new Value(0, DataUnits.BYTE)
        const nextData = next?.transferredData ? next.transferredData : new Value(0, DataUnits.BYTE)
        const deltaData = nextData.value > previousData.value ? nextData.subtractValue(previousData) : nextData
        const deltaTime = previous ? next.timestamp - previous.timestamp : 0

        return {
            deltaTime: deltaTime,
            deltaData: deltaData,
            deltaDataPerSecond: deltaData.divide(deltaTime).multiply(1000)
        }
    }

    protected calculateResult(measurements: ISpeedChangeDelta[]): ISpeedCalculationResult {
        const averageBytesPerSecond = (measurements.length < 2)
            ? measurements[0].deltaDataPerSecond
            : measurements
                .map(e => e.deltaDataPerSecond)
                .reduce((previous, current) => previous.addValue(current))
                .divide(measurements.length)
        return {
            samples: measurements.length,
            averagePerSecond: averageBytesPerSecond,
        }
    }

    async calculate(callbacks?: ISpeedCalculationCallbacks): Promise<ISpeedCalculationResult> {
        const measurements: ISpeedChangeDelta[] = []
        const calculationBuffer = new ChangeCalculationBuffer<ISpeedStateChangeEvent, ISpeedChangeDelta>(this.calculateChangeDelta)

        return iterateTask({
            maxIterations: this.configuration.parameters.maxRequests,
            timeoutAfterMs: this.configuration.parameters.maxDuration,
            iterationDelayMs: this.configuration.parameters.minDelay
        }, async details => {
            calculationBuffer.push({timestamp: details.iteration.startTimeCurrent}) // prefill to resolve issues caused by too fast data transfer
            return performSpeedRequest({
                method: this.configuration.method,
                url: this.configuration.url,
                timeout: details.timeout.remaining!,
                payload: this.configuration.payload
            }, (event: ISpeedStateChangeEvent) => {
                if (event.state !== SpeedRequestState.PROGRESS)
                    return
                if (callbacks?.measurementCallbacks)
                    callbacks.measurementCallbacks.forEach(callback => callback(event))
                const speedEventDelta = calculationBuffer.push(event)
                if (speedEventDelta.deltaTime <= 0)
                    return
                measurements.push(speedEventDelta)
                if (callbacks?.deltaCalculationCallbacks)
                    callbacks.deltaCalculationCallbacks.forEach(callback => callback(speedEventDelta))
            })
        })
            .then(() => {
                const result = this.calculateResult(measurements)
                if (callbacks?.resultCallbacks)
                    callbacks.resultCallbacks.forEach(callback => callback(result))
                return result
            })
    }

}