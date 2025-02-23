import ATest from "../../../misc/test/test.ts";
import SpeedCalculation, {
    ISpeedCalculationConfiguration,
    ISpeedCalculationEventCallbacks,
    ISpeedCalculationResult
} from "../../calculations/speed-calculation.ts";

export type ISpeedTestConfiguration = ISpeedCalculationConfiguration
export type ISpeedTestInput = ISpeedCalculationEventCallbacks
export type ISpeedTestResult = ISpeedCalculationResult

export default class SpeedTest extends ATest<ISpeedTestConfiguration, ISpeedTestInput, ISpeedTestResult> {

    protected calculation: SpeedCalculation

    constructor(speedTestConfiguration: ISpeedTestConfiguration) {
        super({
            details: {
                id: "Speed Test",
                description: "Computes the transfer speed of data between the client and a web endpoint.\n" +
                    `Test method: ${speedTestConfiguration.method}, Endpoint: ${speedTestConfiguration.url}`
            },
            testSetupConfiguration: speedTestConfiguration
        });

        this.calculation = new SpeedCalculation(speedTestConfiguration)
    }

    protected runTest(input?: ISpeedCalculationEventCallbacks): Promise<ISpeedCalculationResult> {
        return this.calculation.calculate(input)
    }

}