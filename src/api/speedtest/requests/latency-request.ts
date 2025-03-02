import {EventAggregator, EventCallback, IStatefulEvent} from "../../misc/events/event.ts"
import {
    IHttpRequest,
    IHttpRequestHandling,
    performCustomHttpRequest
} from "../../misc/http/http-request.ts"

export enum LatencyRequestMethod {
    PREFLIGHT = 'OPTIONS',
    HEAD = 'HEAD',
    REQUEST = 'GET'
}

export interface ILatencyRequest {
    method: LatencyRequestMethod
    url: string
    timeout?: number
}

export enum LatencyRequestState {
    STARTED,
    COMPLETED,
    FAILURE
}

export type ILatencyStateChangeEvent = IStatefulEvent<LatencyRequestState>
export type LatencyStateChangeEventCallback = EventCallback<ILatencyStateChangeEvent>

export default function performLatencyRequest(request: ILatencyRequest, ...eventCallbacks: LatencyStateChangeEventCallback[]): Promise<ILatencyStateChangeEvent[]> {

    function latencyStateChangeEvent(state: LatencyRequestState, timestamp: number = window.performance.now()): ILatencyStateChangeEvent {
        return {
            timestamp: timestamp,
            state: state
        }
    }

    const httpRequest: IHttpRequest = {
        method: request.method,
        url: request.url,
        settings: {
            timeout: request.timeout,
            responseType: 'blob'
        }
    }

    const httpRequestHandling: IHttpRequestHandling<ILatencyStateChangeEvent[], undefined> = {
        configuration: (xhr: XMLHttpRequest, resolve: (value: ILatencyStateChangeEvent[]) => void, _: (reason?: undefined) => void) => {
            const aggregator = new EventAggregator<ILatencyStateChangeEvent>(...eventCallbacks)
            xhr.addEventListener("readystatechange", () => {
                if (xhr.readyState == XMLHttpRequest.OPENED) {
                    aggregator.capture(latencyStateChangeEvent(LatencyRequestState.STARTED))
                }
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    if (!(xhr.status >= 200 && xhr.status < 400)) {
                        aggregator.capture(latencyStateChangeEvent(LatencyRequestState.FAILURE))
                    }
                    aggregator.capture(latencyStateChangeEvent(LatencyRequestState.COMPLETED))
                    resolve(aggregator.events)
                }
            })
        }
    }

    return performCustomHttpRequest(httpRequest, httpRequestHandling)
}