import "./normal-input-slider.scss"
import {Mark} from "@mui/material/Slider/useSlider.types"
import InputSlider from "../slider/input-slider.tsx"

export interface NonLinearSliderProperties {
    id?: string
    className?: string
    min?: number
    max?: number
    step?: number | null
    marks?: Mark[]
    value?: number
    disabled?: boolean
    onValueChange?: (value: number) => void
}

export interface ScalableMark extends Mark {
    actualValue: number
}

export default function NormalInputSlider(properties: NonLinearSliderProperties) {

    function convertMarks(marks: Mark[]): ScalableMark[] {
        return marks.map((mark, index) => {
            return {
                ...mark,
                value: index,
                actualValue: mark.value
            }
        })
    }

    function getActualByIndexValue(index: number): number {
        return convertedMarks[index].actualValue
    }

    function getIndexByActualValue(value: number): number {
        return convertedMarks.find(mark => mark.actualValue == value)!.value
    }

    const convertedMarks = properties.marks ? convertMarks(properties.marks) : []

    return (
        <InputSlider id={properties.id}
                     className={properties.className ? `non-linear-input-slider ${properties.className}` : "non-linear-input-slider"}
                     min={0} max={convertedMarks[convertedMarks.length - 1].value} step={properties.step}
                     marks={convertedMarks}
                     value={getIndexByActualValue(properties.value || 0)}
                     scale={getActualByIndexValue}
                     disabled={properties.disabled}
                     onValueChange={(value: number) => properties.onValueChange ? properties.onValueChange(getActualByIndexValue(value)) : {}}
        />
    )
}