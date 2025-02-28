import Unit from "../unit.ts";
import Value from "../value.ts";

export enum DataUnitType {
    BASE = 1,
    SI= 1000,
    BINARY = 1024
}

export enum DataUnitBase {
    BIT = 1,
    BYTE = 8
}

export class DataUnit extends Unit {

    readonly type: DataUnitType
    readonly base: DataUnitBase
    readonly exponent: number

    constructor(unit: string, unitText: string, type: DataUnitType, base: DataUnitBase, exponent: number) {
        super(`data_unit_${unit}`, unit, unitText, Math.pow(type, exponent) * base);
        this.type = type
        this.base = base
        this.exponent = exponent
    }
}

export class DataUnits {

    static readonly BIT: DataUnit = new DataUnit("b", "Bit", DataUnitType.BASE, DataUnitBase.BIT, 1)

    static readonly KILO_BIT: DataUnit = new DataUnit("kb", "Kilobit", DataUnitType.SI, DataUnitBase.BIT, 1)
    static readonly MEGA_BIT: DataUnit = new DataUnit("Mb", "Megabit", DataUnitType.SI, DataUnitBase.BIT, 2)
    static readonly GIGA_BIT: DataUnit = new DataUnit("Gb", "Gigabit", DataUnitType.SI, DataUnitBase.BIT, 3)
    static readonly TERA_BIT: DataUnit = new DataUnit("Tb", "Terabit", DataUnitType.SI, DataUnitBase.BIT, 4)
    static readonly PETA_BIT: DataUnit = new DataUnit("Pb", "Petabit", DataUnitType.SI, DataUnitBase.BIT, 5)

    static readonly KIBI_BIT: DataUnit = new DataUnit("Kib", "Kibibit", DataUnitType.BINARY, DataUnitBase.BIT, 1)
    static readonly MEBI_BIT: DataUnit = new DataUnit("Mib", "Mebibit", DataUnitType.BINARY, DataUnitBase.BIT, 1)
    static readonly GIBI_BIT: DataUnit = new DataUnit("Gib", "Gibibit", DataUnitType.BINARY, DataUnitBase.BIT, 1)
    static readonly TEBI_BIT: DataUnit = new DataUnit("Tib", "Tebibit", DataUnitType.BINARY, DataUnitBase.BIT, 1)
    static readonly PEBI_BIT: DataUnit = new DataUnit("Pib", "Pebibit", DataUnitType.BINARY, DataUnitBase.BIT, 1)

    static readonly BYTE: DataUnit = new DataUnit("B", "Byte", DataUnitType.BASE, DataUnitBase.BYTE, 1)

    static readonly KILO_BYTE: DataUnit = new DataUnit("kB", "Kilobyte", DataUnitType.SI, DataUnitBase.BYTE, 1)
    static readonly MEGA_BYTE: DataUnit = new DataUnit("MB", "Megabyte", DataUnitType.SI, DataUnitBase.BYTE, 2)
    static readonly GIGA_BYTE: DataUnit = new DataUnit("GB", "Gigabyte", DataUnitType.SI, DataUnitBase.BYTE, 3)
    static readonly TERA_BYTE: DataUnit = new DataUnit("TB", "Terabyte", DataUnitType.SI, DataUnitBase.BYTE, 4)
    static readonly PETA_BYTE: DataUnit = new DataUnit("PB", "Petabyte", DataUnitType.SI, DataUnitBase.BYTE, 5)

    static readonly KIBI_BYTE: DataUnit = new DataUnit("KiB", "Kibibyte", DataUnitType.BINARY, DataUnitBase.BYTE, 1)
    static readonly MEBI_BYTE: DataUnit = new DataUnit("MiB", "Mebibyte", DataUnitType.BINARY, DataUnitBase.BYTE, 2)
    static readonly GIBI_BYTE: DataUnit = new DataUnit("GiB", "Gibibyte", DataUnitType.BINARY, DataUnitBase.BYTE, 3)
    static readonly TEBI_BYTE: DataUnit = new DataUnit("TiB", "Tebibyte", DataUnitType.BINARY, DataUnitBase.BYTE, 4)
    static readonly PEBI_BYTE: DataUnit = new DataUnit("PiB", "Pebibyte", DataUnitType.BINARY, DataUnitBase.BYTE, 5)

    static values(): DataUnit[] {
        return [this.BIT, this.BYTE,
            this.KILO_BIT, this.KIBI_BIT, this.KILO_BYTE, this.KIBI_BYTE,
            this.MEGA_BIT, this.MEBI_BIT, this.MEGA_BYTE, this.MEBI_BYTE,
            this.GIGA_BIT, this.GIBI_BIT, this.GIGA_BYTE, this.GIBI_BYTE,
            this.TERA_BIT, this.TEBI_BIT, this.TERA_BYTE, this.TEBI_BYTE,
            this.PETA_BIT, this.PEBI_BIT, this.PETA_BYTE, this.PEBI_BYTE
        ]
    }

    static fit(value: Value<DataUnit>, type: DataUnitType, base: DataUnitBase, resultDecimals: number = 2): Value<DataUnit> {
        const decimals = resultDecimals < 0 ? 0 : resultDecimals
        const baseValue = Value.convert(value, base == DataUnitBase.BIT ? this.BIT : this.BYTE, decimals)
        const units = this.values()
            .filter(unit => (unit.type == type || unit.type == DataUnitType.BASE) && unit.base == base)
            .sort((a, b) => a.conversionBaseFactor - b.conversionBaseFactor)
        const index = Math.min(units.length - 1, Math.floor(Math.log(baseValue.value) / Math.log(type)))
        return Value.convert(baseValue, units[index], decimals)
    }
}