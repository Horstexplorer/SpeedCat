import "./input-slider.scss"
import {Slider} from "@mui/material"
import {Mark} from "@mui/material/Slider/useSlider.types"

export interface InputSliderProperties {
    id?: string
    className?: string
    min?: number
    max?: number
    step?: number | null
    marks?: Mark[]
    value?: number
    disabled?: boolean
    onValueChange?: (value: number) => void
    scale?: (value: number) => number
}

export default function InputSlider(properties: InputSliderProperties) {
    return (
        <Slider id={properties.id}
                className={properties.className ? `input-slider ${properties.className}` : "input-slider"}
                min={properties.min} max={properties.max} step={properties.step}
                marks={properties.marks}
                value={properties.value}
                disabled={properties.disabled}
                scale={properties.scale}
                onChange={(_: Event, value: number | number[]) => {
                    if (properties.onValueChange) {
                        properties.onValueChange(Number.parseInt(value.toString()))
                    }
                }}
        />
    )
}