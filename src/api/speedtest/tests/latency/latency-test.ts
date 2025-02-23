import ATest from "../../../misc/test/test.ts";
import LatencyCalculation, {
    ILatencyCalculationEventCallbacks,
    ILatencyCalculationConfiguration,
    ILatencyCalculationResult
} from "../../calculations/latency-calculation.ts";

export type ILatencyTestConfiguration = ILatencyCalculationConfiguration
export type ILatencyTestInput = ILatencyCalculationEventCallbacks
export type ILatencyTestResult = ILatencyCalculationResult

export default class LatencyTest extends ATest<ILatencyTestConfiguration, ILatencyTestInput, ILatencyTestResult> {

    protected calculation: LatencyCalculation

    constructor(latencyTestConfiguration: ILatencyTestConfiguration) {
        super({
            details: {
                id: "Latency Test",
                description: "Computes the request latency between the client and a web endpoint.\n"+
                    `Test method: ${latencyTestConfiguration.method}, Endpoint: ${latencyTestConfiguration.url}`
            },
            testSetupConfiguration: latencyTestConfiguration
        });

        this.calculation = new LatencyCalculation(latencyTestConfiguration)
    }

    protected runTest(input?: ILatencyTestInput): Promise<ILatencyTestResult> {
        return this.calculation.calculate(input)
    }

}