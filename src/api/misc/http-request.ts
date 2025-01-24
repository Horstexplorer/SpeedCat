export type RequestPayload = Document | XMLHttpRequestBodyInit | null

export interface IHttpRequestHandling {
    xhr: {
        provider: () => XMLHttpRequest
        customization?: (xhr: XMLHttpRequest) => void
    }
    configuration: (xhr: XMLHttpRequest, resolve: (value: unknown) => void, reject: (reason?: any) => void) => void
}

export interface IHttpRequest {
    method: string
    url: string
    timeout?: number
    payload?: RequestPayload
}

export default class HttpRequestManager {

    private readonly defaultRequestHandling?: IHttpRequestHandling

    constructor(requestHandling?: IHttpRequestHandling) {
        this.defaultRequestHandling = requestHandling
    }

    protected async performHttpRequest(requestDetails: IHttpRequest, requestHandling?: IHttpRequestHandling): Promise<any> {
        if (!requestHandling && this.defaultRequestHandling) {
            requestHandling = this.defaultRequestHandling
        }
        return performHttpRequest(requestDetails, requestHandling)
    }
}

export async function performHttpRequest(requestDetails: IHttpRequest, requestHandling?: IHttpRequestHandling): Promise<any> {
    return new Promise((resolve, reject) => {
        if (!requestHandling) {
            reject("Cannot send request: Missing request handling")
            return
        }
        const xhrRequest = requestHandling.xhr.provider()
        if (requestHandling?.xhr.customization)
            requestHandling.xhr.customization(xhrRequest)
        requestHandling.configuration(xhrRequest, resolve, reject)
        if (requestDetails.timeout)
            xhrRequest.timeout = requestDetails.timeout
        xhrRequest.open(requestDetails.method, requestDetails.url)
        xhrRequest.send(requestDetails.payload)
    })
}