import {performHttpRequest} from "../misc/http/http-request.ts";

export const TEST_FILE_INDEX_LOCATION = "test-file-index.json"

export interface ITestFileDefinition {
    path: string
    byteSize?: number
    flags?: {
        selectable?: boolean
        default?: boolean
    }
}

export interface ITestFileIndex {
    testFiles: ITestFileDefinition[]
}

export async function fetchTestFileIndex(): Promise<ITestFileIndex> {
    const httpResponse = await performHttpRequest({
        method: 'GET',
        url: TEST_FILE_INDEX_LOCATION,
        settings: {
            responseType: "json"
        }
    })
    return httpResponse.payload as ITestFileIndex
}