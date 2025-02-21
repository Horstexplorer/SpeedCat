export type RequestPayload = Document | XMLHttpRequestBodyInit | null
export type ResponseType = XMLHttpRequestResponseType

export interface IHttpRequest {
    method: string
    url: string
    payload?: RequestPayload
    settings?: {
        headers?: Map<string, string>
        timeout?: number
        responseType?: ResponseType
    }
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

        if (requestDetails.settings?.timeout)
            xhrRequest.timeout = requestDetails.settings?.timeout

        if (requestDetails.settings?.responseType)
            xhrRequest.responseType = requestDetails.settings?.responseType

        requestHandling.configuration(xhrRequest, resolve, reject)

        xhrRequest.open(requestDetails.method, requestDetails.url, true)

        if (requestDetails.settings?.headers)
            requestDetails.settings?.headers.forEach((value, key) => xhrRequest.setRequestHeader(key, value))

        xhrRequest.send(requestDetails.payload)
    })
}

export const IHttpRequestHandling_DEFAULTS: IHttpRequestHandling<IHttpResponse, IHttpResponse> = {
    configuration: (xhr: XMLHttpRequest, resolve: (value: any) => void, reject: (value?: any) => void) => {
        xhr.addEventListener("readystatechange", () => {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                if (xhr.status >= 200 && xhr.status < 400) {
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