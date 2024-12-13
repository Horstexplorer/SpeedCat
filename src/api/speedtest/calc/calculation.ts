export interface ICalculationConfiguration {}

export interface ICalculationCallbacks {}

export interface ICalculationResult {}

export abstract class ACalculation<IConfig extends ICalculationConfiguration, ICall extends ICalculationCallbacks, IRes extends ICalculationResult> {

    protected configuration: IConfig

    protected constructor(configuration: IConfig) {
        this.configuration = configuration
    }

    abstract calculate(callbacks?: ICall): Promise<IRes>

}