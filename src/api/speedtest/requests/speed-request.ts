import {EventAggregator, EventCallback, IStatefulEvent} from "../../events/event.ts";
import {IHttpRequest, IHttpRequestHandling, performCustomHttpRequest, RequestPayload} from "../../misc/http/http-request.ts";
import {DataUnit, DataUnits} from "../../misc/units/types/data-units.ts";
import Value from "../../misc/units/value.ts";

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
export type SpeedChangeEventCallback = EventCallback<ISpeedStateChangeEvent>

export default function performSpeedRequest(request: ISpeedRequest, ...eventCallbacks: SpeedChangeEventCallback[]): Promise<ISpeedStateChangeEvent[]> {

    function eventOf(state: SpeedRequestState, transferredBytes?: number): ISpeedStateChangeEvent {
        return {
            timestamp: window.performance.now(),
            state: state,
            transferredData: transferredBytes ? new Value(transferredBytes, DataUnits.BYTE) : undefined
        }
    }

    const httpRequest: IHttpRequest = {
        method: request.method,
        url: request.url,
        timeout: request.timeout,
        payload: request.payload
    }
    const httpRequestHandling: IHttpRequestHandling<ISpeedStateChangeEvent[], undefined> = {
        configuration: (xhr: XMLHttpRequest, resolve: (value: ISpeedStateChangeEvent[]) => void, _: (reason?: undefined) => void) => {
            const aggregator = new EventAggregator<ISpeedStateChangeEvent>(...eventCallbacks)
            xhr.addEventListener("progress", (event) =>
                aggregator.capture(eventOf(SpeedRequestState.PROGRESS, event.lengthComputable ? event.loaded : undefined)))
            xhr.upload.addEventListener("progress", (event) =>
                aggregator.capture(eventOf(SpeedRequestState.PROGRESS, event.lengthComputable ? event.loaded : undefined)))
            xhr.addEventListener("readystatechange", () => {
                if (xhr.readyState == XMLHttpRequest.OPENED) {
                    aggregator.capture(eventOf(SpeedRequestState.STARTED))
                }
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    if (!(xhr.status >= 200 && xhr.status < 400)) {
                        aggregator.capture(eventOf(SpeedRequestState.FAILURE))
                    }
                    aggregator.capture(eventOf(SpeedRequestState.COMPLETED))
                    resolve(aggregator.events)
                }
            })
            xhr.responseType = 'blob'
        }
    }
    return performCustomHttpRequest(httpRequest, httpRequestHandling)
}