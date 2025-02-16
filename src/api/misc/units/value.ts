import Unit from "./unit.ts";

export default class Value<U extends Unit> {
    readonly value: number
    readonly unit: U

    constructor(value: number, unit: U) {
        this.value = value
        this.unit = unit
    }

    static convert<T extends Unit>(value: Value<T>, to: T, resultDecimals: number = 2): Value<T> {
        return new Value<T>(
            Unit.convert(value.value, value.unit, to, resultDecimals),
            to
        )
    }

    toString(): string {
        return `${this.value} ${this.unit.unit}`
    }

    add(amount: number): Value<U> {
        return new Value<U>(
            this.value + amount,
            this.unit
        )
    }

    addValue(value: Value<U>): Value<U> {
        return this.add(Value.convert(value, this.unit).value)
    }

    subtract(amount: number): Value<U> {
        return new Value<U>(
            this.value - amount,
            this.unit
        )
    }

    subtractValue(value: Value<U>): Value<U> {
        return this.subtract(Value.convert(value, this.unit).value)
    }

    multiply(factor: number): Value<U> {
        return new Value<U>(
            this.value * factor,
            this.unit
        )
    }

    divide(factor: number): Value<U> {
        return new Value<U>(
            this.value / factor,
            this.unit
        )
    }

}