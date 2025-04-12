import "./input-slider.scss"
import {Box, Slider, Typography} from "@mui/material"
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
    label?: string
}

export default function InputSlider(properties: InputSliderProperties) {
    return (
        <Box className={properties.className ? `input-slider ${properties.className}` : "input-slider"}>
            {
                properties.label ?
                <Typography className={"input-slider-label"}>
                    {properties.label}
                </Typography> : <></>
            }
            <Slider id={properties.id}
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
        </Box>
    )
}