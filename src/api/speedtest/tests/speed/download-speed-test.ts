import SpeedTest from "./speed-test.ts";
import {SpeedRequestMethod} from "../../requests/speed-request.ts";

export interface IDownloadSpeedTestConfiguration {
    url: string
    parameters: {
        minDelay: number
        maxDuration: number
        maxRequests: number
    }
}

export default class DownloadSpeedTest extends SpeedTest {

    constructor(downloadSpeedTestConfiguration: IDownloadSpeedTestConfiguration) {
        super({
            ...downloadSpeedTestConfiguration,
            method: SpeedRequestMethod.DOWNLOAD
        });
    }

}