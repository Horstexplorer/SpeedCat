export default class Unit {
    readonly uid: string
    readonly unit: string
    readonly unitText: string
    readonly conversionBaseFactor: number

    constructor(uid: string, unit: string, unitText: string, conversionBaseFactor: number) {
        this.uid = uid
        this.unit = unit
        this.unitText = unitText
        this.unit = unit
        this.conversionBaseFactor = conversionBaseFactor
    }

    static convert<T extends Unit>(value: number, from: T, to: T, resultDecimals: number = 2): number {
        const decimals = resultDecimals < 0 ? 0 : resultDecimals
        return parseFloat(((value * from.conversionBaseFactor) / to.conversionBaseFactor).toFixed(decimals))
    }

}
