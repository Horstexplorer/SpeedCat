export type RequestPayload = Document | XMLHttpRequestBodyInit | null

export interface IHttpRequest {
    method: string
    url: string
    timeout?: number
    payload?: RequestPayload
}

export interface IHttpResponse {
    status: number,
    statusText: string,
    response?: any
}

export interface IHttpRequestHandling<RESOLVE, REJECT> {
    configuration: (xhr: XMLHttpRequest, resolve: (value: RESOLVE) => void, reject: (value?: REJECT) => void) => void
}

export async function performCustomHttpRequest<RESOLVE, REJECT>(requestDetails: IHttpRequest, requestHandling: IHttpRequestHandling<RESOLVE, REJECT>): Promise<RESOLVE> {
    return new Promise((resolve, reject) => {
        const xhrRequest = new XMLHttpRequest()
        if (requestDetails.timeout)
            xhrRequest.timeout = requestDetails.timeout
        requestHandling.configuration(xhrRequest, resolve, reject)
        xhrRequest.open(requestDetails.method, requestDetails.url, true)
        xhrRequest.send(requestDetails.payload)
    })
}

export const IHttpRequestHandling_DEFAULTS: IHttpRequestHandling<IHttpResponse, IHttpResponse> = {
    configuration: (xhr: XMLHttpRequest, resolve: (value: any) => void, reject: (value?: any) => void) => {
        xhr.addEventListener("readystatechange", () => {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                if (!(xhr.status >= 200 && xhr.status < 400)) {
                    resolve({
                        status: xhr.status,
                        statusText: xhr.statusText,
                        response: xhr.response
                    })
                } else {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText,
                        response: xhr.response
                    })
                }
            }
        })
    }
}

export async function performHttpRequest(requestDetails: IHttpRequest): Promise<IHttpResponse> {
    return performCustomHttpRequest(requestDetails, IHttpRequestHandling_DEFAULTS)
}