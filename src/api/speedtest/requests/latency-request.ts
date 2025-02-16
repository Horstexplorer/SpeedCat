import {EventAggregator, EventCallback, IStatefulEvent} from "../../events/event.ts";
import {
    IHttpRequest,
    IHttpRequestHandling,
    performCustomHttpRequest
} from "../../misc/http/http-request.ts";

export enum LatencyRequestMethod {
    PREFLIGHT = 'OPTIONS',
    HEAD = 'HEAD',
    REQUEST = 'GET'
}

export interface ILatencyRequest {
    method: LatencyRequestMethod
    url: string
    timeout: number
}

export enum LatencyRequestState {
    STARTED,
    COMPLETED,
    FAILURE
}

export type ILatencyStateChangeEvent = IStatefulEvent<LatencyRequestState>
export type LatencyStateChangeEventCallback = EventCallback<ILatencyStateChangeEvent>

export default function performLatencyRequest(request: ILatencyRequest, ...eventCallbacks: LatencyStateChangeEventCallback[]): Promise<ILatencyStateChangeEvent[]> {

    function eventOf(state: LatencyRequestState): ILatencyStateChangeEvent {
        return {
            timestamp: window.performance.now(),
            state: state
        }
    }

    const httpRequest: IHttpRequest = {
        method: request.method,
        url: request.url,
        timeout: request.timeout
    }
    const httpRequestHandling: IHttpRequestHandling<ILatencyStateChangeEvent[], undefined> = {
        configuration: (xhr: XMLHttpRequest, resolve: (value: ILatencyStateChangeEvent[]) => void, _: (reason?: undefined) => void) => {
            const aggregator = new EventAggregator<ILatencyStateChangeEvent>(...eventCallbacks)
            xhr.addEventListener("readystatechange", () => {
                if (xhr.readyState == XMLHttpRequest.OPENED) {
                    aggregator.capture(eventOf(LatencyRequestState.STARTED))
                }
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    if (!(xhr.status >= 200 && xhr.status < 400)) {
                        aggregator.capture(eventOf(LatencyRequestState.FAILURE))
                    }
                    aggregator.capture(eventOf(LatencyRequestState.COMPLETED))
                    resolve(aggregator.events)
                }
            })
            xhr.responseType = 'blob'
        }
    }
    return performCustomHttpRequest(httpRequest, httpRequestHandling)
}