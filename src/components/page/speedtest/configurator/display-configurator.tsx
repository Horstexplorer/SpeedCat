import "./display-configurator.scss"
import {Box, Grid2, MenuItem, Paper, Select, SelectChangeEvent, Switch, Typography} from "@mui/material";
import useDisplayConfigurationStore from "../../../../api/state/display-configuration-state.ts";
import {DataUnit} from "../../../../api/misc/data-unit-conversion.ts";

export default function DisplayConfigurator() {

    const {
        useSIUnits, setUseSIUnits,
        useByteUnits, setUseByteUnits,
        useFixedUnit, setUseFixedUnit
    } = useDisplayConfigurationStore()

    function getSelectableUnits() {
        return [...DataUnit.unitCollection(useSIUnits, useByteUnits), undefined].map(unit => {
            return {
                key: unit ? unit.name : 'Automatic',
                value: unit
            }
        })
    }

    return (
        <Box className="display-configurator">
            <Paper elevation={5} className={"configurator-paper"}>
                <Grid2 container spacing={2} columns={3}>
                    <Grid2 size={3}>
                        <Typography>Value Display</Typography>
                    </Grid2>
                    <Grid2 size={1} className={"configuration-option"}>
                        <Typography>
                            Binary
                            <Switch checked={useSIUnits} onChange={(_, checked: boolean) => setUseSIUnits(checked)}/>
                            SI
                        </Typography>
                    </Grid2>
                    <Grid2 size={1} className={"configuration-option"}>
                        <Typography>
                            Bit
                            <Switch checked={useByteUnits} onChange={(_, checked: boolean) => setUseByteUnits(checked)}/>
                            Byte
                        </Typography>
                    </Grid2>
                    <Grid2 size={1} className={"configuration-option"}>
                        <Typography>
                            Fixed Unit Selection
                        </Typography>
                        <Select
                            value={useFixedUnit?.name}
                            onChange={(event: SelectChangeEvent) => setUseFixedUnit(DataUnit.ofName(event.target.value))}>
                            {getSelectableUnits().map(entity =>
                                <MenuItem key={entity.key} value={entity.value?.name}>
                                    <Typography>{entity.key}</Typography>
                                </MenuItem>
                            )}
                        </Select>
                    </Grid2>
                </Grid2>
            </Paper>
        </Box>
    )
}