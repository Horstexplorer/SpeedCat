import {RequestPayload} from "../../../misc/http/http-request.ts";
import SpeedTest from "./speed-test.ts";
import {SpeedRequestMethod} from "../../requests/speed-request.ts";

export interface IUploadSpeedTestConfiguration {
    url: string
    payload: RequestPayload
    parameters: {
        minDelay: number
        maxDuration: number
        maxRequests: number
    }
}

export default class UploadSpeedTest extends SpeedTest {

    constructor(uploadSpeedTestConfiguration: IUploadSpeedTestConfiguration) {
        super({
            ...uploadSpeedTestConfiguration,
            method: SpeedRequestMethod.UPLOAD
        });
    }

}