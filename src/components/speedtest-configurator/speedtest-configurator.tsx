import {DataUnit, DataUnitBase, DataUnits, DataUnitType} from "../../api/misc/units/types/data-units"
import Value from "../../api/misc/units/value"
import "./speedtest-configurator.scss"
import {Box, Divider, Grid, IconButton, Paper, Stack, Typography} from "@mui/material"
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import InputSwitch from "../inputs/switch/input-switch.tsx";
import InputSelect from "../inputs/select/input-select.tsx";
import InputText from "../inputs/text/input-text.tsx";
import NormalInputSlider from "../inputs/normal-slider/normal-input-slider.tsx";
import useUploadSpeedTestStore from "../../state/configuration/upload-speed-test-state.ts";
import useDownloadSpeedTestStore from "../../state/configuration/download-speed-test-state.ts";
import useLatencyTestStore from "../../state/configuration/latency-test-state.ts";
import useTestFileConfigurationStore from "../../state/configuration/test-file-configuration-state.ts";
import useDataUnitStore from "../../state/configuration/data-unit-state.ts";
import useInterfaceStore, {UPDATE_INTERVAL_MS_OPTIONS} from "../../state/configuration/interface-state.ts";

export default function SpeedtestConfigurator() {

    const {updateIntervalMs, _actions: interfaceActions, _ctrl: interfaceControls} = useInterfaceStore()

    const {base: unitBase, type: unitType, unit, _actions: unitActions, _ctrl: unitControls} = useDataUnitStore()

    const {testFileConfiguration, _ctrl: assetCtrl} = useTestFileConfigurationStore()
    if (!assetCtrl.readyToBeUsed)
        throw assetCtrl.bootstrap()

    const {enabled: latencyEnabled, parameters: latencyParameters, _actions: latencyActions, _ctrl: latencyControls} = useLatencyTestStore()
    if (!latencyControls.readyToBeUsed)
        throw latencyControls.bootstrap()

    const {enabled: downloadEnabled, payloadSize: downloadSize, parameters: downloadParameters, _actions: downloadActions, _ctrl: downloadControls} = useDownloadSpeedTestStore()
    if (!downloadControls.readyToBeUsed)
        throw downloadControls.bootstrap()

    const {enabled: uploadEnabled, payloadSize: uploadSize, parameters: uploadParameters, _actions: uploadActions, _ctrl: uploadControls} = useUploadSpeedTestStore()
    if (!uploadControls.readyToBeUsed)
        throw uploadControls.bootstrap()

    function convertToBytes(value: number): Value<DataUnit> {
        return new Value(value, DataUnits.BYTE)
    }

    const selectableUpdateIntervalValues: { value: number, label: string }[] = UPDATE_INTERVAL_MS_OPTIONS
        .map(msOption => {
            return { value: msOption, label: `${msOption} ms`}
        })

    const selectableDataUnitDisplayValues: { key: string, value: string }[] = DataUnits.values()
        .filter(dataUnit => dataUnit.base == unitBase && dataUnit.type == unitType)
        .map(unit => {
            return {key: `${unit.unitText} (${unit.unit})`, value: unit?.uid}
        })

    const selectableTestFileSizeDisplayValues: { value: number, label: string }[] = testFileConfiguration?.dataDefinitions
            .filter(definition => definition.flags?.selectable)
            .map(definition => {
                const bytes = convertToBytes(definition.byteSize!)
                const displayValue = unitActions.convert(bytes)
                return {
                    value: bytes.value,
                    label: displayValue.toString()
                }
            })
        ?? []

    return (
        <Box className="speedtest-configurator">
            <Stack direction={"column"} spacing={1}>

                <Paper elevation={5} className={"configurator-paper interface-configurator"}>
                    <Stack spacing={1}>
                        <Stack direction={"row"} spacing={0} className={"header-controls"}>
                            <Typography className={"configurator-title"}>
                                Interface
                            </Typography>
                            <Box className={"full-width-spacer"} />
                            <IconButton className={"header-controls-button"} onClick={() => interfaceControls.resetState()}>
                                <RotateLeftIcon />
                            </IconButton>
                        </Stack>
                        <Divider/>
                        <Stack direction={"column"} spacing={1}>
                            <NormalInputSlider id={"interface-update-interval"}
                                               label={"Content update interval"}
                                               min={Math.min(...selectableUpdateIntervalValues.map(entry => entry.value))}
                                               max={Math.max(...selectableUpdateIntervalValues.map(entry => entry.value))}
                                               step={null}
                                               marks={selectableUpdateIntervalValues}
                                               value={updateIntervalMs}
                                               onValueChange={value => interfaceActions.setUpdateInterval(value)}
                            />
                        </Stack>
                    </Stack>
                </Paper>

                <Paper elevation={5} className={"configurator-paper display-value-configurator"}>
                    <Stack spacing={1}>
                        <Stack direction={"row"} spacing={0} className={"header-controls"}>
                            <Typography className={"configurator-title"}>
                                Display Value
                            </Typography>
                            <Box className={"full-width-spacer"} />
                            <IconButton className={"header-controls-button"} onClick={() => unitControls.resetState()}>
                                <RotateLeftIcon />
                            </IconButton>
                        </Stack>
                        <Divider/>
                        <Grid container spacing={2} columns={2} size={1}>
                            <Grid size={1} className={"center-align"}>
                                <Typography>
                                    Binary
                                    <InputSwitch id={"format-using-si-values"}
                                                 value={unitType == DataUnitType.SI}
                                                 onValueChange={value => unitActions.setType(value ? DataUnitType.SI : DataUnitType.BINARY)}
                                    />
                                    SI
                                </Typography>
                                <Typography>
                                    Bit
                                    <InputSwitch id={"format-using-bit-values"}
                                                 value={unitBase == DataUnitBase.BYTE}
                                                 onValueChange={value => unitActions.setBase(value ? DataUnitBase.BYTE : DataUnitBase.BIT)}
                                    />
                                    Byte
                                </Typography>
                            </Grid>
                            <Grid size={1} className={"center-align"}>
                                <Typography>
                                    Unit Selection
                                </Typography>
                                <InputSelect id={"format-using-data-unit"}
                                             value={unit?.uid}
                                             availableValues={selectableDataUnitDisplayValues}
                                             onValueChange={value => unitActions.setUnit(DataUnits.values().find(dataUnit => dataUnit.uid == value))}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                </Paper>

                <Paper elevation={5} className={"configurator-paper latency-test-configurator"}>
                    <Stack spacing={1}>
                        <Stack direction={"row"} spacing={0} className={"header-controls"}>
                            <Typography className={"configurator-title"}>
                                Latency Test Settings
                            </Typography>
                            <Box className={"full-width-spacer"} />
                            <InputSwitch id={"enable-latency-test"}
                                         value={latencyEnabled}
                                         onValueChange={value => latencyActions.setEnabled(value)}
                            />
                            <IconButton className={"header-controls-button"} onClick={() => latencyControls.resetState()}>
                                <RotateLeftIcon />
                            </IconButton>
                        </Stack>
                        <Divider/>
                        <Stack direction={"column"} spacing={1}>
                            <InputText id={"latency-min-delay"}
                                       label={"min. Delay Between Requests (ms)"}
                                       type={"number"}
                                       disabled={!latencyEnabled}
                                       value={latencyParameters.minDelay}
                                       onValueChange={(value: string) => latencyActions.setParameters(Number.parseInt(value), undefined, undefined)}
                            />
                            <InputText id={"latency-max-duration"}
                                       label={"max. Request Duration (ms)"}
                                       type={"number"}
                                       disabled={!latencyEnabled}
                                       value={latencyParameters.maxDuration}
                                       onValueChange={(value: string) => latencyActions.setParameters(undefined, Number.parseInt(value), undefined)}
                            />
                            <InputText id={"latency-max-amount"}
                                       label={"max. Request Amount"}
                                       type={"number"}
                                       disabled={!latencyEnabled}
                                       value={latencyParameters.maxRequests}
                                       onValueChange={(value: string) => latencyActions.setParameters(undefined, undefined, Number.parseInt(value))}
                            />
                        </Stack>
                    </Stack>
                </Paper>

                <Paper elevation={5} className={"configurator-paper download-test-configurator"}>
                    <Stack spacing={1}>
                        <Stack direction={"row"} spacing={0} className={"header-controls"}>
                            <Typography className={"configurator-title"}>
                                Download Test Settings
                            </Typography>
                            <Box className={"full-width-spacer"} />
                            <InputSwitch id={"enable-download-test"}
                                         value={downloadEnabled}
                                         onValueChange={value => downloadActions.setEnabled(value)}
                            />
                            <IconButton className={"header-controls-button"} onClick={() => downloadControls.resetState()}>
                                <RotateLeftIcon />
                            </IconButton>
                        </Stack>
                        <Divider/>
                        <Stack direction={"column"} spacing={1}>
                            <NormalInputSlider id={"download-payload-size"}
                                               label={"Payload size"}
                                               min={Math.min(...selectableTestFileSizeDisplayValues.map(entry => entry.value))}
                                               max={Math.max(...selectableTestFileSizeDisplayValues.map(entry => entry.value))}
                                               step={null}
                                               marks={selectableTestFileSizeDisplayValues}
                                               disabled={!downloadEnabled}
                                               value={downloadSize!.value}
                                               onValueChange={value => downloadActions.setPayloadSize(convertToBytes(value))}
                            />
                            <InputText id={"download-min-delay"}
                                       label={"min. Delay Between Requests (ms)"}
                                       type={"number"}
                                       disabled={!downloadEnabled}
                                       value={downloadParameters.minDelay}
                                       onValueChange={(value: string) => downloadActions.setParameters(Number.parseInt(value), undefined, undefined)}
                            />
                            <InputText id={"download-max-duration"}
                                       label={"max. Request Duration (ms)"}
                                       type={"number"}
                                       disabled={!downloadEnabled}
                                       value={downloadParameters.maxDuration}
                                       onValueChange={(value: string) => downloadActions.setParameters(undefined, Number.parseInt(value), undefined)}
                            />
                            <InputText id={"download-max-amount"}
                                       label={"max. Request Amount"}
                                       type={"number"}
                                       disabled={!downloadEnabled}
                                       value={downloadParameters.maxRequests}
                                       onValueChange={(value: string) => downloadActions.setParameters(undefined, undefined, Number.parseInt(value))}
                            />
                        </Stack>
                    </Stack>
                </Paper>

                <Paper elevation={5} className={"configurator-paper upload-test-configurator"}>
                    <Stack spacing={1}>
                        <Stack direction={"row"} spacing={0} className={"header-controls"}>
                            <Typography className={"configurator-title"}>
                                Upload Test Settings
                            </Typography>
                            <Box className={"full-width-spacer"} />
                            <InputSwitch id={"enable-upload-test"}
                                         value={uploadEnabled}
                                         onValueChange={value => uploadActions.setEnabled(value)}
                            />
                            <IconButton className={"header-controls-button"} onClick={() => uploadControls.resetState()}>
                                <RotateLeftIcon />
                            </IconButton>
                        </Stack>
                        <Divider/>
                        <Stack direction={"column"} spacing={1}>
                            <NormalInputSlider id={"upload-payload-size"}
                                               label={"Payload size"}
                                               min={Math.min(...selectableTestFileSizeDisplayValues.map(entry => entry.value))}
                                               max={Math.max(...selectableTestFileSizeDisplayValues.map(entry => entry.value))}
                                               step={null}
                                               marks={selectableTestFileSizeDisplayValues}
                                               disabled={!uploadEnabled}
                                               value={uploadSize!.value}
                                               onValueChange={value => uploadActions.setPayloadSize(convertToBytes(value))}
                            />
                            <InputText id={"upload-min-delay"}
                                       label={"min. Delay Between Requests (ms)"}
                                       type={"number"}
                                       disabled={!uploadEnabled}
                                       value={uploadParameters.minDelay}
                                       onValueChange={(value: string) => uploadActions.setParameters(Number.parseInt(value), undefined, undefined)}
                            />
                            <InputText id={"upload-max-duration"}
                                       label={"max. Request Duration (ms)"}
                                       type={"number"}
                                       disabled={!uploadEnabled}
                                       value={uploadParameters.maxDuration}
                                       onValueChange={(value: string) => uploadActions.setParameters(undefined, Number.parseInt(value), undefined)}
                            />
                            <InputText id={"upload-max-amount"}
                                       label={"max. Request Amount"}
                                       type={"number"}
                                       disabled={!uploadEnabled}
                                       value={uploadParameters.maxRequests}
                                       onValueChange={(value: string) => uploadActions.setParameters(undefined, undefined, Number.parseInt(value))}
                            />
                        </Stack>
                    </Stack>
                </Paper>

            </Stack>
        </Box>
    )
}