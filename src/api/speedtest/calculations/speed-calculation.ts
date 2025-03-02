import {
    ACalculation,
    ICalculationConfiguration,
    ICalculationEventCallbacks,
    ICalculationResult
} from "./calculation.ts"
import performSpeedRequest, {
    ISpeedStateChangeEvent,
    SpeedRequestMethod,
    SpeedRequestState,
    SpeedStateChangeEventCallback
} from "../requests/speed-request.ts"
import {RequestPayload} from "../../misc/http/http-request.ts"
import Value from "../../misc/units/value.ts"
import {DataUnit, DataUnitBase, DataUnits, DataUnitType} from "../../misc/units/types/data-units.ts"
import {EventCallback, IEvent} from "../../misc/events/event.ts"
import {combineCallbacks} from "../../misc/events/callback.ts"
import {iterateTask} from "../../misc/iteration/iteration.ts"
import {ChangeCalculationBuffer} from "../../misc/change-buffer.ts"

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
    deltaData: Value<DataUnit>,
    dataPerSecond: Value<DataUnit>
}

export type ISpeedChangeDeltaEvent = ISpeedChangeDelta & IEvent
export type SpeedChangeDeltaEventCallback = EventCallback<ISpeedChangeDeltaEvent>

function speedChangeDeltaEvent(speedChangeDelta: ISpeedChangeDelta, timestamp: number = window.performance.now()): ISpeedChangeDeltaEvent {
    return {
        timestamp: timestamp,
        ...speedChangeDelta
    }
}

export interface ISpeedCalculationResult extends ICalculationResult {
    samples: number
    averageDataPerSecond: Value<DataUnit>
}

export type ISpeedCalculationResultEvent = ISpeedCalculationResult & IEvent
export type SpeedCalculationResultEventCallback = EventCallback<ISpeedCalculationResultEvent>

function speedCalculationResultEvent(speedCalculationResult: ISpeedCalculationResult, timestamp: number = window.performance.now()): ISpeedCalculationResultEvent {
    return {
        timestamp: timestamp,
        ...speedCalculationResult
    }
}

export interface ISpeedCalculationEventCallbacks extends ICalculationEventCallbacks {
    stateChange?: SpeedStateChangeEventCallback
    changeDelta?: SpeedChangeDeltaEventCallback
    result?: SpeedCalculationResultEventCallback
}

export function defaultSpeedCalculationCallbacks(callbacks?: ISpeedCalculationEventCallbacks, message: string = "Speed") {
    const copy: ISpeedCalculationEventCallbacks = callbacks ? {...callbacks} : {}

    copy.changeDelta = combineCallbacks(copy.changeDelta, delta =>
        console.debug(message, `${DataUnits.fit(delta.deltaData, DataUnitType.SI, DataUnitBase.BYTE)} in ${delta.deltaTime} ms`, delta))
    copy.result = combineCallbacks(copy.result, result =>
        console.debug(message, `${DataUnits.fit(result.averageDataPerSecond, DataUnitType.SI, DataUnitBase.BYTE)}`, result))

    return copy
}

function calculateChangeDelta(previous: ISpeedStateChangeEvent | undefined, next: ISpeedStateChangeEvent): ISpeedChangeDelta {
    const previousData = previous?.transferredData ? previous.transferredData : new Value(0, DataUnits.BYTE)
    const nextData = next?.transferredData ? next.transferredData : new Value(0, DataUnits.BYTE)
    const deltaData = nextData.value > previousData.value ? nextData.subtractValue(previousData) : nextData
    const deltaTime = previous ? next.timestamp - previous.timestamp : 0

    return {
        deltaTime: deltaTime,
        deltaData: deltaData,
        dataPerSecond: deltaData.divide(deltaTime).multiply(1000)
    }
}

function calculateSpeedCalculationResult(changeDeltas: ISpeedChangeDelta[]): ISpeedCalculationResult {
    const totalTime = changeDeltas
        .map(changeDelta => changeDelta.deltaTime)
        .reduce((previous, current) => previous + current, 0)
    const averageDataPerSecond = changeDeltas
        .map(change => change.dataPerSecond.multiply(change.deltaTime).divide(totalTime))
        .reduce((previous, current) => previous.addValue(current))

    return {
        samples: changeDeltas.length,
        averageDataPerSecond: averageDataPerSecond,
    }
}

export default class SpeedCalculation extends ACalculation<ISpeedCalculationConfiguration, ISpeedCalculationEventCallbacks, ISpeedCalculationResult> {

    constructor(configuration: ISpeedCalculationConfiguration) {
        super(configuration)
    }

    override async calculate(callbacks?: ISpeedCalculationEventCallbacks): Promise<ISpeedCalculationResult> {
        const measurements: ISpeedChangeDelta[] = []
        const calculationBuffer = new ChangeCalculationBuffer<ISpeedStateChangeEvent, ISpeedChangeDelta>(calculateChangeDelta)

        await iterateTask({
            maxIterations: this.configuration.parameters.maxRequests,
            timeoutAfterMs: this.configuration.parameters.maxDuration,
            iterationDelayMs: this.configuration.parameters.minDelay
        }, async details => {
            calculationBuffer.push({timestamp: details.iteration.startTimeCurrent})
            return performSpeedRequest({
                method: this.configuration.method,
                url: this.configuration.url,
                timeout: details.timeout.remaining!,
                payload: this.configuration.payload
            }, (event: ISpeedStateChangeEvent) => {
                if (event.state !== SpeedRequestState.PROGRESS)
                    return
                if (callbacks?.stateChange)
                    callbacks.stateChange(event)
                const changeDelta = calculationBuffer.push(event)
                if (changeDelta.deltaTime <= 0)
                    return
                measurements.push(changeDelta)
                if (callbacks?.changeDelta)
                    callbacks.changeDelta(speedChangeDeltaEvent(changeDelta))
            })
        })

        const result = calculateSpeedCalculationResult(measurements)
        if (callbacks?.result)
            callbacks?.result(speedCalculationResultEvent(result))

        return result
    }

}