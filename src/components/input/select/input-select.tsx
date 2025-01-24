import "./input-select.scss"
import {MenuItem, Select, SelectChangeEvent, Typography} from "@mui/material";

export interface InputSelectProperties {
    id?: string
    classname?: string
    value?: string
    availableValues?: { key?: string, value?: string }[]
    onValueChange?: (value: string) => void
}

export default function InputSelect(properties: InputSelectProperties) {

    return (
        <Select id={properties.id}
                className={properties.classname ? "input-select " + properties.classname : "input-select"}
                displayEmpty={true}
                value={properties.value}
                onChange={(event: SelectChangeEvent) => {
                    if (properties.onValueChange) {
                        properties.onValueChange(event.target.value)
                    }
                }}>
            {properties.availableValues?.map(entity =>
                <MenuItem key={entity.key} value={entity.value}>
                    <Typography>{entity.key}</Typography>
                </MenuItem>
            )}
        </Select>
    )

}