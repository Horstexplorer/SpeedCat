import {EventAggregator, EventCallback, IStatefulEvent} from "../../misc/events/event.ts"
import {
    IHttpRequest,
    IHttpRequestHandling,
    performCustomHttpRequest,
    RequestPayload
} from "../../misc/http/http-request.ts"
import {DataUnit, DataUnits} from "../../misc/units/types/data-units.ts"
import Value from "../../misc/units/value.ts"

export enum SpeedRequestMethod {
    DOWNLOAD = 'GET',
    UPLOAD = 'POST'
}

export interface ISpeedRequest {
    method: SpeedRequestMethod
    url: string
    timeout: number
    payload?: RequestPayload
}

export enum SpeedRequestState {
    STARTED,
    PROGRESS,
    COMPLETED,
    FAILURE
}

export interface ISpeedStateChangeEvent extends IStatefulEvent<SpeedRequestState> {
    transferredData?: Value<DataUnit>
}

export type SpeedStateChangeEventCallback = EventCallback<ISpeedStateChangeEvent>

export default function performSpeedRequest(request: ISpeedRequest, ...eventCallbacks: SpeedStateChangeEventCallback[]): Promise<ISpeedStateChangeEvent[]> {

    function speedStateChangeEvent(state: SpeedRequestState, transferredBytes?: number, timestamp: number = window.performance.now()): ISpeedStateChangeEvent {
        return {
            timestamp: timestamp,
            state: state,
            transferredData: transferredBytes ? new Value(transferredBytes, DataUnits.BYTE) : undefined
        }
    }

    const httpRequest: IHttpRequest = {
        method: request.method,
        url: request.url,
        payload: request.payload,
        settings: {
            timeout: request.timeout,
            responseType: "blob"
        }
    }

    const httpRequestHandling: IHttpRequestHandling<ISpeedStateChangeEvent[], undefined> = {
        configuration: (xhr: XMLHttpRequest, resolve: (value: ISpeedStateChangeEvent[]) => void, _: (reason?: undefined) => void) => {
            const aggregator = new EventAggregator<ISpeedStateChangeEvent>(...eventCallbacks)
            xhr.addEventListener("progress", (event) =>
                aggregator.capture(speedStateChangeEvent(SpeedRequestState.PROGRESS, event.lengthComputable ? event.loaded : undefined)))
            xhr.upload.addEventListener("progress", (event) =>
                aggregator.capture(speedStateChangeEvent(SpeedRequestState.PROGRESS, event.lengthComputable ? event.loaded : undefined)))
            xhr.addEventListener("readystatechange", () => {
                if (xhr.readyState == XMLHttpRequest.OPENED) {
                    aggregator.capture(speedStateChangeEvent(SpeedRequestState.STARTED))
                }
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    if (!(xhr.status >= 200 && xhr.status < 400)) {
                        aggregator.capture(speedStateChangeEvent(SpeedRequestState.FAILURE))
                    }
                    aggregator.capture(speedStateChangeEvent(SpeedRequestState.COMPLETED))
                    resolve(aggregator.events)
                }
            })
        }
    }
    return performCustomHttpRequest(httpRequest, httpRequestHandling)
}