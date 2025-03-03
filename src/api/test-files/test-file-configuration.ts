import {fetchTestFileIndex, ITestFileDefinition, ITestFileIndex} from "./test-file-definition.ts";

export default class TestFileConfiguration {

    readonly testFileIndex: ITestFileIndex

    constructor(testFileIndex: ITestFileIndex) {
        this.testFileIndex = testFileIndex
    }

    get orderedByByteSize(): ITestFileDefinition[] {
        return this.testFileIndex.testFiles
            .sort((first, second) => (first.byteSize || -1) - (second.byteSize || -1))
    }

    get noDataDefinitions(): ITestFileDefinition[] {
        return this.orderedByByteSize
            .filter(definition => !definition.byteSize || definition.byteSize <= 0)
    }

    get dataDefinitions(): ITestFileDefinition[] {
        return this.orderedByByteSize
            .filter(definition => definition.byteSize && definition.byteSize > 0)
    }
}

export async function getTestFileConfiguration(): Promise<TestFileConfiguration> {
    const index = await fetchTestFileIndex()
    return new TestFileConfiguration(index)
}