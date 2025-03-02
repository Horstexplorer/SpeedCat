import "./speedtest-configurator.scss"
import {Box, Grid2, IconButton, Paper, Typography} from "@mui/material"
import {useEffect, useState} from "react"
import InputText from "../../../input/text/input-text.tsx"
import SaveIcon from '@mui/icons-material/Save'
import HistoryIcon from '@mui/icons-material/History'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import NormalInputSlider from "../../../input/normal-slider/normal-input-slider.tsx"
import InputSelect from "../../../input/select/input-select.tsx"
import InputSwitch from "../../../input/switch/input-switch.tsx"
import useDataUnitStore from "../../../../state/configuration/data-unit-state.ts"
import {DataUnitBase, DataUnits, DataUnitType} from "../../../../api/misc/units/types/data-units.ts"
import useAssetConfigurationStore from "../../../../state/configuration/asset-configuration-state.ts"
import useLatencyTestStore, {latencyTestStateDefaults} from "../../../../state/configuration/latency-test-state.ts"
import {getPathToAsset} from "../../../../api/test-files/asset-index.ts"
import useDownloadSpeedTestStore, {
    downloadSpeedTestStateDefaults
} from "../../../../state/configuration/download-speed-test-state.ts"
import useUploadSpeedTestStore, {uploadSpeedTestStateDefaults} from "../../../../state/configuration/upload-speed-test-state.ts"

export default function SpeedtestConfigurator() {

    console.log("Loading")

    const {base: unitBase, type: unitType, unit, _actions: unitActions} = useDataUnitStore()

    const {assetConfiguration, _ctrl: assetCtrl} = useAssetConfigurationStore()
    if (!assetCtrl.readyToBeUsed)
        throw assetCtrl.bootstrap()

    const {parameters: latencyParameters, _actions: latencyActions, _ctrl: latencyControls} = useLatencyTestStore()
    if (!latencyControls.readyToBeUsed)
        throw latencyControls.bootstrap()

    const {payloadSize: downloadSize, parameters: downloadParameters, _actions: downloadActions, _ctrl: downloadControls} = useDownloadSpeedTestStore()
    if (!downloadControls.readyToBeUsed)
        throw downloadControls.bootstrap()

    const {payloadSize: uploadSize, parameters: uploadParameters, _actions: uploadActions, _ctrl: uploadControls} = useUploadSpeedTestStore()
    if (!uploadControls.readyToBeUsed)
        throw uploadControls.bootstrap()

    console.log("Completely Loaded")


    return (
        <Box className="speedtest-configurator">
            <Grid2 container spacing={1} columns={1}>

                {/*<Grid2 size={1}>*/}
                {/*    <Paper elevation={5} className={"configurator-paper"}>*/}
                {/*        <Grid2 container spacing={2} columns={3}>*/}
                {/*            <Grid2 size={1} className={"center-align"}>*/}
                {/*                <Typography>Save Changes</Typography>*/}
                {/*                <IconButton onClick={() => saveValidConfigurationAsUserConfig()}>*/}
                {/*                    <SaveIcon/>*/}
                {/*                </IconButton>*/}
                {/*            </Grid2>*/}
                {/*            <Grid2 size={1} className={"center-align"}>*/}
                {/*                <Typography>Reload From Current</Typography>*/}
                {/*                <IconButton onClick={() => restoreUserConfigFromPersistedVersion()}>*/}
                {/*                    <HistoryIcon/>*/}
                {/*                </IconButton>*/}
                {/*            </Grid2>*/}
                {/*            <Grid2 size={1} className={"center-align"}>*/}
                {/*                <Typography>Restore Defaults</Typography>*/}
                {/*                <IconButton onClick={() => restoreUserConfigDefaults()}>*/}
                {/*                    <RotateLeftIcon/>*/}
                {/*                </IconButton>*/}
                {/*            </Grid2>*/}
                {/*        </Grid2>*/}
                {/*    </Paper>*/}
                {/*</Grid2>*/}

                <Grid2 size={1}>
                    <Paper elevation={5} className={"configurator-paper"}>
                        <Grid2 container spacing={2} columns={1}>
                            <Grid2 size={1}>
                                Display
                            </Grid2>
                            <Grid2 container spacing={2} columns={2} size={1}>
                                <Grid2 size={1} className={"center-align"}>
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
                                </Grid2>
                                <Grid2 size={1} className={"center-align"}>
                                    <Typography>
                                        Unit Selection
                                    </Typography>
                                    <InputSelect id={"format-using-data-unit"}
                                                 value={unit?.uid}
                                                 availableValues={DataUnits.values()
                                                     .filter(dataUnit => dataUnit.base == unitBase && dataUnit.type == unitType)
                                                     .map(unit => {
                                                        return {key: `${unit.unitText} (${unit.unit})`, value: unit?.uid}})}
                                                 onValueChange={value => unitActions.setUnit(DataUnits.values().find(dataUnit => dataUnit.uid == value))}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>
                    </Paper>
                </Grid2>

                {/*<Grid2 size={1}>*/}
                {/*    <Paper elevation={5} className={"configurator-paper"}>*/}
                {/*        <Grid2 container spacing={2} columns={1}>*/}
                {/*            <Grid2 size={1}>*/}
                {/*                Latency*/}
                {/*                <InputSwitch id={"enable-latency-test"}*/}
                {/*                             value={configurableUserConfiguration?.latency.enabled}*/}
                {/*                             onValueChange={value => {*/}
                {/*                                 setConfigurableUserConfiguration({*/}
                {/*                                     ...configurableUserConfiguration,*/}
                {/*                                     latency: {*/}
                {/*                                         ...configurableUserConfiguration.latency,*/}
                {/*                                         enabled: value*/}
                {/*                                     }*/}
                {/*                                 })*/}
                {/*                             }}*/}
                {/*                />*/}
                {/*            </Grid2>*/}
                {/*            <Grid2 size={1}>*/}
                {/*                <InputText id={"latency-max-amount"}*/}
                {/*                           label={"max. Request Amount"}*/}
                {/*                           type={"number"}*/}
                {/*                           disabled={!configurableUserConfiguration?.latency.enabled}*/}
                {/*                           value={configurableUserConfiguration?.latency.maxRequests}*/}
                {/*                           onValueChange={(value: string) => {*/}
                {/*                               setConfigurableUserConfiguration({*/}
                {/*                                   ...configurableUserConfiguration,*/}
                {/*                                   latency: {*/}
                {/*                                       ...configurableUserConfiguration.latency,*/}
                {/*                                       maxRequests: Number.parseInt(value)*/}
                {/*                                   }*/}
                {/*                               })*/}
                {/*                           }}*/}
                {/*                />*/}
                {/*            </Grid2>*/}
                {/*            <Grid2 size={1}>*/}
                {/*                <InputText id={"latency-max-duration"}*/}
                {/*                           label={"max. Request Duration (ms)"}*/}
                {/*                           type={"number"}*/}
                {/*                           disabled={!configurableUserConfiguration?.latency.enabled}*/}
                {/*                           value={configurableUserConfiguration?.latency.maxDuration}*/}
                {/*                           onValueChange={(value: string) => {*/}
                {/*                               setConfigurableUserConfiguration({*/}
                {/*                                   ...configurableUserConfiguration,*/}
                {/*                                   latency: {*/}
                {/*                                       ...configurableUserConfiguration.latency,*/}
                {/*                                       maxDuration: Number.parseInt(value)*/}
                {/*                                   }*/}
                {/*                               })*/}
                {/*                           }}*/}
                {/*                />*/}
                {/*            </Grid2>*/}
                {/*        </Grid2>*/}
                {/*    </Paper>*/}
                {/*</Grid2>*/}

                {/*<Grid2 size={1}>*/}
                {/*    <Paper elevation={5} className={"configurator-paper"}>*/}
                {/*        <Grid2 container spacing={2} columns={1}>*/}
                {/*            <Grid2 size={1}>*/}
                {/*                Download*/}
                {/*                <InputSwitch id={"enable-download-test"}*/}
                {/*                             value={configurableUserConfiguration?.download.enabled}*/}
                {/*                             onValueChange={value => {*/}
                {/*                                 setConfigurableUserConfiguration({*/}
                {/*                                     ...configurableUserConfiguration,*/}
                {/*                                     download: {*/}
                {/*                                         ...configurableUserConfiguration.download,*/}
                {/*                                         enabled: value*/}
                {/*                                     }*/}
                {/*                                 })*/}
                {/*                             }}*/}
                {/*                />*/}
                {/*            </Grid2>*/}
                {/*            <Grid2 size={1}>*/}
                {/*                <NormalInputSlider id={"download-payload-size"}*/}
                {/*                                   min={getAvailablePayloadSizeMarks()[0]?.value}*/}
                {/*                                   max={getAvailablePayloadSizeMarks()[getAvailablePayloadSizeMarks().length - 1]?.value}*/}
                {/*                                   step={null}*/}
                {/*                                   marks={getAvailablePayloadSizeMarks()}*/}
                {/*                                   disabled={!configurableUserConfiguration?.download.enabled}*/}
                {/*                                   value={configurableUserConfiguration?.download.payloadByteSize}*/}
                {/*                                   onValueChange={(value) => {*/}
                {/*                                       setConfigurableUserConfiguration({*/}
                {/*                                           ...configurableUserConfiguration,*/}
                {/*                                           download: {*/}
                {/*                                               ...configurableUserConfiguration.download,*/}
                {/*                                               payloadByteSize: value*/}
                {/*                                           }*/}
                {/*                                       })*/}
                {/*                                   }}*/}
                {/*                />*/}
                {/*            </Grid2>*/}
                {/*            <Grid2 size={1}>*/}
                {/*                <InputText id={"download-max-amount"}*/}
                {/*                           label={"max. Request Amount"}*/}
                {/*                           type={"number"}*/}
                {/*                           disabled={!configurableUserConfiguration?.download.enabled}*/}
                {/*                           value={configurableUserConfiguration?.download.maxRequests}*/}
                {/*                           onValueChange={(value: string) => {*/}
                {/*                               setConfigurableUserConfiguration({*/}
                {/*                                   ...configurableUserConfiguration,*/}
                {/*                                   download: {*/}
                {/*                                       ...configurableUserConfiguration.download,*/}
                {/*                                       maxRequests: Number.parseInt(value)*/}
                {/*                                   }*/}
                {/*                               })*/}
                {/*                           }}*/}
                {/*                />*/}
                {/*            </Grid2>*/}
                {/*            <Grid2 size={1}>*/}
                {/*                <InputText id={"download-max-duration"}*/}
                {/*                           label={"max. Request Duration (ms)"}*/}
                {/*                           type={"number"}*/}
                {/*                           disabled={!configurableUserConfiguration?.download.enabled}*/}
                {/*                           value={configurableUserConfiguration?.download.maxDuration}*/}
                {/*                           onValueChange={(value: string) => {*/}
                {/*                               setConfigurableUserConfiguration({*/}
                {/*                                   ...configurableUserConfiguration,*/}
                {/*                                   download: {*/}
                {/*                                       ...configurableUserConfiguration.download,*/}
                {/*                                       maxDuration: Number.parseInt(value)*/}
                {/*                                   }*/}
                {/*                               })*/}
                {/*                           }}*/}
                {/*                />*/}
                {/*            </Grid2>*/}
                {/*        </Grid2>*/}
                {/*    </Paper>*/}
                {/*</Grid2>*/}

                {/*<Grid2 size={1}>*/}
                {/*    <Paper elevation={5} className={"configurator-paper"}>*/}
                {/*        <Grid2 container spacing={2} columns={1}>*/}
                {/*            <Grid2 size={1}>*/}
                {/*                Upload*/}
                {/*                <InputSwitch id={"enable-upload-test"}*/}
                {/*                             value={configurableUserConfiguration?.upload.enabled}*/}
                {/*                             onValueChange={value => {*/}
                {/*                                 setConfigurableUserConfiguration({*/}
                {/*                                     ...configurableUserConfiguration,*/}
                {/*                                     upload: {*/}
                {/*                                         ...configurableUserConfiguration.upload,*/}
                {/*                                         enabled: value*/}
                {/*                                     }*/}
                {/*                                 })*/}
                {/*                             }}*/}
                {/*                />*/}
                {/*            </Grid2>*/}
                {/*            <Grid2 size={1}>*/}
                {/*                <NormalInputSlider id={"upload-payload-size"}*/}
                {/*                                   min={getAvailablePayloadSizeMarks()[0]?.value}*/}
                {/*                                   max={getAvailablePayloadSizeMarks()[getAvailablePayloadSizeMarks().length - 1]?.value}*/}
                {/*                                   step={null}*/}
                {/*                                   marks={getAvailablePayloadSizeMarks()}*/}
                {/*                                   disabled={!configurableUserConfiguration?.upload.enabled}*/}
                {/*                                   value={configurableUserConfiguration?.upload.payloadByteSize}*/}
                {/*                                   onValueChange={(value) => {*/}
                {/*                                       setConfigurableUserConfiguration({*/}
                {/*                                           ...configurableUserConfiguration,*/}
                {/*                                           upload: {*/}
                {/*                                               ...configurableUserConfiguration.upload,*/}
                {/*                                               payloadByteSize: value*/}
                {/*                                           }*/}
                {/*                                       })*/}
                {/*                                   }}*/}
                {/*                />*/}
                {/*            </Grid2>*/}
                {/*            <Grid2 size={1}>*/}
                {/*                <InputText id={"upload-max-amount"}*/}
                {/*                           label={"max. Request Amount"}*/}
                {/*                           type={"number"}*/}
                {/*                           disabled={!configurableUserConfiguration?.upload.enabled}*/}
                {/*                           value={configurableUserConfiguration?.upload.maxRequests}*/}
                {/*                           onValueChange={(value: string) => {*/}
                {/*                               setConfigurableUserConfiguration({*/}
                {/*                                   ...configurableUserConfiguration,*/}
                {/*                                   upload: {*/}
                {/*                                       ...configurableUserConfiguration.upload,*/}
                {/*                                       maxRequests: Number.parseInt(value)*/}
                {/*                                   }*/}
                {/*                               })*/}
                {/*                           }}*/}
                {/*                />*/}
                {/*            </Grid2>*/}
                {/*            <Grid2 size={1}>*/}
                {/*                <InputText id={"upload-max-duration"}*/}
                {/*                           label={"max. Request Duration (ms)"}*/}
                {/*                           type={"number"}*/}
                {/*                           disabled={!configurableUserConfiguration?.upload.enabled}*/}
                {/*                           value={configurableUserConfiguration?.upload.maxDuration}*/}
                {/*                           onValueChange={(value: string) => {*/}
                {/*                               setConfigurableUserConfiguration({*/}
                {/*                                   ...configurableUserConfiguration,*/}
                {/*                                   upload: {*/}
                {/*                                       ...configurableUserConfiguration.upload,*/}
                {/*                                       maxDuration: Number.parseInt(value)*/}
                {/*                                   }*/}
                {/*                               })*/}
                {/*                           }}*/}
                {/*                />*/}
                {/*            </Grid2>*/}
                {/*        </Grid2>*/}
                {/*    </Paper>*/}
                {/*</Grid2>*/}
            </Grid2>
        </Box>
    )
}