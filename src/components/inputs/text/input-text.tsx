import "./input-text.scss"
import {TextField} from "@mui/material"
import * as React from "react"

export interface InputTextProperties {
    id?: string
    label?: string
    value?: any
    defaultValue?: any
    type: React.InputHTMLAttributes<unknown>['type']
    disabled?: boolean
    onValueChange?: (value: string) => void
}

export default function InputText(properties: InputTextProperties) {

    return (
        <TextField
            id={properties.id} className={`input-text input-text-${properties.type}`}
            label={properties.label}
            value={properties.value}
            defaultValue={properties.defaultValue}
            type={properties.type}
            disabled={properties.disabled}
            onChange={(event) => {
                if (properties.onValueChange) {
                    properties.onValueChange(event.target.value)
                }
            }}
            slotProps={{
                inputLabel: {
                    shrink: true,
                }
            }}
            fullWidth
        />
    )
}