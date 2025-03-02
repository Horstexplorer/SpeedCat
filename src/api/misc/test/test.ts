export interface ITestConfiguration<TEST_SETUP_CONFIG> {
    details: {
        id: string,
        description: string
    }
    testSetupConfiguration?: TEST_SETUP_CONFIG
}

export interface ITestExecutionInput<TEST_RUN_INPUT, TEST_RUN_RESULT> {
    controls?: {
        skip?: boolean
    }
    testRunInput?: TEST_RUN_INPUT
    testRunResultEvaluator?: (result?: TEST_RUN_RESULT) => TestResultState
}

export enum TestResultState {
    UNKNOWN,
    SKIPPED,
    SUCCESS,
    FAILURE
}


export interface ITestExecutionResult<T> {
    state: TestResultState,
    testRunResult?: T | any | undefined
    time: {
        startTimestamp: number,
        runtimeMs: number
    }
}

export default abstract class ATest<TEST_SETUP_CONFIG,  TEST_RUN_INPUT, TEST_RUN_RESULT> {

    protected readonly configuration?: ITestConfiguration<TEST_SETUP_CONFIG>

    protected constructor(configuration: ITestConfiguration<TEST_SETUP_CONFIG>) {
        this.configuration = configuration
    }

    protected abstract runTest(input?: TEST_RUN_INPUT): Promise<TEST_RUN_RESULT>

    public async run(testInput?: ITestExecutionInput<TEST_RUN_INPUT, TEST_RUN_RESULT>): Promise<ITestExecutionResult<TEST_RUN_RESULT>> {

        function testExecutionResult(state: TestResultState, testRunResult: any, startTimestamp: number, runtimeMs: number): ITestExecutionResult<TEST_RUN_RESULT> {
            return {
                state: state,
                testRunResult: testRunResult,
                time: {
                    startTimestamp: startTimestamp,
                    runtimeMs: runtimeMs
                }
            }
        }

        const startTime = window.performance.now()

        let executionResult

        if (testInput?.controls?.skip)
            executionResult = testExecutionResult(TestResultState.SKIPPED, undefined, startTime, window.performance.now() - startTime)
        else {
            try {
                const runResult = await this.runTest(testInput?.testRunInput)
                const testState = testInput?.testRunResultEvaluator ? testInput.testRunResultEvaluator(runResult) : TestResultState.SUCCESS

                executionResult = testExecutionResult(testState, runResult, startTime, window.performance.now() - startTime)
            } catch (exception) {
                executionResult = testExecutionResult(TestResultState.FAILURE, exception, startTime, window.performance.now() - startTime)
            }
        }

        return executionResult
    }

}