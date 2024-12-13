import {EventAggregator, EventCallback, IStatefulEvent} from "../../events/event.ts";
import HttpRequestManager, {IHttpRequest, IHttpRequestHandling, RequestPayload} from "./http-request.ts";

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
    transferredBytes?: number
}
export type SpeedChangeEventCallback = EventCallback<ISpeedStateChangeEvent>

export default class SpeedRequestManager extends HttpRequestManager {

    constructor() {
        super()
    }

    protected convertRequest(request: ISpeedRequest): IHttpRequest {
        return {
            method: request.method,
            url: request.url,
            timeout: request.timeout,
            payload: request.payload
        }
    }

    protected eventOf(state: SpeedRequestState, transferredBytes?: number): ISpeedStateChangeEvent {
        return {
            timestamp: window.performance.now(),
            state: state,
            transferredBytes: transferredBytes
        }
    }

    async performSpeedRequest(request: ISpeedRequest, ...eventCallbacks: SpeedChangeEventCallback[]): Promise<ISpeedStateChangeEvent[]> {
        const requestHandling: IHttpRequestHandling = {
            xhr: {
                provider: () => new window.XMLHttpRequest()
            },
            configuration: (xhr: XMLHttpRequest, resolve: (value: unknown) => void, _: (reason?: any) => void) => {
                const aggregator = new EventAggregator<ISpeedStateChangeEvent>(...eventCallbacks)
                xhr.addEventListener("progress", (event) =>
                    aggregator.capture(this.eventOf(SpeedRequestState.PROGRESS, event.lengthComputable ? event.loaded : undefined)))
                xhr.upload.addEventListener("progress", (event) =>
                    aggregator.capture(this.eventOf(SpeedRequestState.PROGRESS, event.lengthComputable ? event.loaded : undefined)))
                xhr.addEventListener("readystatechange", () => {
                    if (xhr.readyState == XMLHttpRequest.OPENED) {
                        aggregator.capture(this.eventOf(SpeedRequestState.STARTED))
                    }
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        if (!(xhr.status >= 200 && xhr.status < 400)) {
                            aggregator.capture(this.eventOf(SpeedRequestState.FAILURE))
                        }
                        aggregator.capture(this.eventOf(SpeedRequestState.COMPLETED))
                        resolve(aggregator.events)
                    }
                })
            }
        }
        return this.performHttpRequest(this.convertRequest(request), requestHandling)
    }

}