export class DataUnit {
    readonly name: string
    readonly unit: string
    readonly bitFactor: number

    constructor(name: string, unit: string, bitFactor: number) {
        this.name = name
        this.unit = unit
        this.bitFactor = bitFactor
    }

    static readonly BIT: DataUnit = new DataUnit("Bit", "b", 1)
    static readonly KILO_BIT: DataUnit = new DataUnit("Kilobit", "Kb", Math.pow(1000, 1))
    static readonly MEGA_BIT: DataUnit = new DataUnit("Megabit", "Mb", Math.pow(1000, 2))
    static readonly GIGA_BIT: DataUnit = new DataUnit("Gigabit", "Gb", Math.pow(1000, 3))
    static readonly TERA_BIT: DataUnit = new DataUnit("Terabit", "Tb", Math.pow(1000, 4))
    static readonly PETA_BIT: DataUnit = new DataUnit("Petabit", "Pb", Math.pow(1000, 5))
    static readonly KIBI_BIT: DataUnit = new DataUnit("Kibibit", "Kib", Math.pow(1024, 1))
    static readonly MEBI_BIT: DataUnit = new DataUnit("Mebibit", "Mib", Math.pow(1024, 2))
    static readonly GIBI_BIT: DataUnit = new DataUnit("Gibibit", "Gib", Math.pow(1024, 3))
    static readonly TEBI_BIT: DataUnit = new DataUnit("Tebibit", "Tib", Math.pow(1024, 4))
    static readonly PEBI_BIT: DataUnit = new DataUnit("Pebibit", "Pib", Math.pow(1024, 5))

    static readonly BYTE: DataUnit = new DataUnit("Byte", "B", 8)
    static readonly KILO_BYTE: DataUnit = new DataUnit("Kilobyte", "KB", Math.pow(1000, 1) * 8)
    static readonly MEGA_BYTE: DataUnit = new DataUnit("Megabyte", "MB", Math.pow(1000, 2) * 8)
    static readonly GIGA_BYTE: DataUnit = new DataUnit("Gigabyte", "GB", Math.pow(1000, 3) * 8)
    static readonly TERA_BYTE: DataUnit = new DataUnit("Terabyte", "TB", Math.pow(1000, 4) * 8)
    static readonly PETA_BYTE: DataUnit = new DataUnit("Petabyte", "PB", Math.pow(1000, 5) * 8)
    static readonly KIBI_BYTE: DataUnit = new DataUnit("Kibibyte", "KiB", Math.pow(1024, 1) * 8)
    static readonly MEBI_BYTE: DataUnit = new DataUnit("Mebibyte", "MiB", Math.pow(1024, 2) * 8)
    static readonly GIBI_BYTE: DataUnit = new DataUnit("Gibibyte", "GiB", Math.pow(1024, 3) * 8)
    static readonly TEBI_BYTE: DataUnit = new DataUnit("Tebibyte", "TiB", Math.pow(1024, 4) * 8)
    static readonly PEBI_BYTE: DataUnit = new DataUnit("Pebibyte", "PiB", Math.pow(1024, 5) * 8)

    static unitCollection(si: boolean = false, byteValues: boolean = true): DataUnit[] {
        if (si && byteValues) {
            return [this.BYTE, this.KILO_BYTE, this.MEGA_BYTE, this.GIGA_BYTE, this.TERA_BYTE, this.PETA_BYTE]
        } else if (si) {
            return [this.BIT, this.KILO_BIT, this.MEGA_BIT, this.GIGA_BIT, this.TERA_BIT, this.PETA_BIT]
        } else if (byteValues) {
            return [this.BYTE, this.KIBI_BYTE, this.MEBI_BYTE, this.GIBI_BYTE, this.TEBI_BYTE, this.PEBI_BYTE]
        } else {
            return [this.BIT, this.KIBI_BIT, this.MEBI_BIT, this.GIBI_BIT, this.TEBI_BIT, this.PEBI_BIT]
        }
    }

    static ofName(name?: string): DataUnit | undefined {
        const values = [
            this.BYTE, this.KILO_BYTE, this.MEGA_BYTE, this.GIGA_BYTE, this.TERA_BYTE, this.PETA_BYTE,
            this.KIBI_BYTE, this.MEBI_BYTE, this.GIBI_BYTE, this.TEBI_BYTE, this.PEBI_BYTE,
            this.BIT, this.KILO_BIT, this.MEGA_BIT, this.GIGA_BIT, this.TERA_BIT, this.PETA_BIT,
            this.KIBI_BIT, this.MEBI_BIT, this.GIBI_BIT, this.TEBI_BIT, this.PEBI_BIT
        ]
        return values.find(value => value.name.toUpperCase() == name?.toUpperCase())
    }

}

export interface DataValue {
    value: number
    unit: DataUnit
}

export function convertDataUnit(value: number, from: DataUnit, to: DataUnit, resultDecimals: number = 2): number {
    return parseFloat(((value * from.bitFactor) / to.bitFactor).toFixed(resultDecimals))
}

export function convertDataValue(dataValue: DataValue, toUnit?: DataUnit, resultDecimals: number = 2, si: boolean = false, byteValues: boolean = true): DataValue {
    if (!toUnit) {
        return fitDataUnit(dataValue, resultDecimals, si, byteValues)
    }
    return {
        value: convertDataUnit(dataValue.value, dataValue.unit, toUnit, resultDecimals),
        unit: toUnit
    }
}

export function fitDataUnit(value: DataValue, resultDecimals: number = 2, si: boolean = false, byteValues: boolean = true): DataValue {
    if (!+value.value) return value
    const base = convertDataValue(value, byteValues ? DataUnit.BYTE : DataUnit.BIT)
    const units = DataUnit.unitCollection(si, byteValues)
    const decimals = resultDecimals < 0 ? 0 : resultDecimals
    const factor = si ? 1000 : 1024
    const index = Math.min(units.length - 1, Math.floor(Math.log(base.value) / Math.log(factor)))
    return convertDataValue(base, units[index], decimals)
}