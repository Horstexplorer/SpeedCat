import {EventAggregator, EventCallback, IStatefulEvent} from "../../events/event.ts";
import HttpRequestManager, {IHttpRequest, IHttpRequestHandling} from "./http-request.ts";

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

export default class LatencyRequestManager extends HttpRequestManager {

    constructor() {
        super()
    }

    protected convertRequest(request: ILatencyRequest): IHttpRequest {
        return {
            method: request.method,
            url: request.url,
            timeout: request.timeout
        }
    }

    protected eventOf(state: LatencyRequestState): ILatencyStateChangeEvent {
        return {
            timestamp: window.performance.now(),
            state: state
        }
    }

    async performLatencyRequest(request: ILatencyRequest, ...eventCallbacks: LatencyStateChangeEventCallback[]): Promise<ILatencyStateChangeEvent[]> {
        const requestHandling: IHttpRequestHandling = {
            xhr: {
                provider: () => new window.XMLHttpRequest()
            },
            configuration: (xhr: XMLHttpRequest, resolve: (value: unknown) => void, _: (reason?: any) => void) => {
                const aggregator = new EventAggregator<ILatencyStateChangeEvent>(...eventCallbacks)
                xhr.addEventListener("readystatechange", () => {
                    if (xhr.readyState == XMLHttpRequest.OPENED) {
                        aggregator.capture(this.eventOf(LatencyRequestState.STARTED))
                    }
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        if (!(xhr.status >= 200 && xhr.status < 400)) {
                            aggregator.capture(this.eventOf(LatencyRequestState.FAILURE))
                        }
                        aggregator.capture(this.eventOf(LatencyRequestState.COMPLETED))
                    }
                })
                xhr.addEventListener("loadend", () => {
                    resolve(aggregator.events)
                })
            }
        }
        return this.performHttpRequest(this.convertRequest(request), requestHandling)
    }
}