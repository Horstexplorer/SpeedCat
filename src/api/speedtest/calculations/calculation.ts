export interface ICalculationConfiguration {}

export interface ICalculationEventCallbacks {}

export interface ICalculationResult {}

export abstract class ACalculation<IConfig extends ICalculationConfiguration, ICall extends ICalculationEventCallbacks, IRes extends ICalculationResult> {

    protected configuration: IConfig

    protected constructor(configuration: IConfig) {
        this.configuration = configuration
    }

    abstract calculate(callbacks?: ICall): Promise<IRes>

}