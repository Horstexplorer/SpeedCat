import "./input-switch.scss"
import {Switch} from "@mui/material"

export interface IInputSwitchProperties {
    id?: string
    className?: string
    value?: boolean
    onValueChange?: (value: boolean) => void
}

export default function InputSwitch(properties: IInputSwitchProperties) {
    return (
        <Switch id={properties.id}
                className={properties.className ? `input-switch ${properties.className}` : "input-switch"}
                checked={properties.value}
                onChange={(_, checked: boolean) => {
                    if (properties.onValueChange) {
                        properties.onValueChange(checked)
                    }
                }}
        />
    )
}