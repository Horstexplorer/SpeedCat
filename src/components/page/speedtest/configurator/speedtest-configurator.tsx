import "./speedtest-configurator.scss"
import {Box, Grid2, IconButton, Paper, Typography} from "@mui/material";
import useAssetConfigurationStore from "../../../../api/state/asset-configuration-state.ts";
import {useEffect, useState} from "react";
import useUserConfigurationStore from "../../../../api/state/user-configuration-state.ts";
import {
    buildDefaultSpeedtestUserConfiguration, getDefaultDataUnit
} from "../../../../api/speedtest-user-configuration/user-configuration-builder.ts";
import InputText from "../../../input/text/input-text.tsx";
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import {fetchAssetConfiguration} from "../../../../api/test-files/asset-configuration.ts";
import {ISpeedtestUserConfiguration} from "../../../../api/speedtest-user-configuration/user-configuration.ts";
import NormalInputSlider from "../../../input/normal-slider/normal-input-slider.tsx";
import {
    validateUserConfiguration
} from "../../../../api/speedtest-user-configuration/user-configuration-verification.ts";
import {convertDataValue, DataUnit} from "../../../../api/misc/data-unit-conversion.ts";
import InputSelect from "../../../input/select/input-select.tsx";
import InputSwitch from "../../../input/switch/input-switch.tsx";

export default function SpeedtestConfigurator() {

    const {assetConfiguration, setAssetConfiguration} = useAssetConfigurationStore();
    const {userTestConfiguration, saveUserTestConfiguration} = useUserConfigurationStore();
    const [configurableUserConfiguration, setConfigurableUserConfiguration] = useState<ISpeedtestUserConfiguration>(userTestConfiguration!)

    const [readyToRender, setReadyToRender] = useState<boolean>(false)

    useEffect(() => {
        if (!assetConfiguration) {
            fetchAssetConfiguration().then(config => setAssetConfiguration(config))
        } else if (!userTestConfiguration) {
            saveUserTestConfiguration(buildDefaultSpeedtestUserConfiguration(assetConfiguration))
        } else {
            setConfigurableUserConfiguration({...userTestConfiguration})
            setReadyToRender(true)
        }
    }, [assetConfiguration, userTestConfiguration, readyToRender]);

    function getAvailablePayloadSizeMarks(): { value: number, label: string }[] {
        return assetConfiguration?.getOrderedAvailablePayloadSizes()
            .map(option => {
                const byteValue = convertDataValue({value: option, unit: DataUnit.BYTE},
                    DataUnit.ofId(configurableUserConfiguration.display.useFixedUnit), 2, configurableUserConfiguration.display.useSIUnits, configurableUserConfiguration.display.useByteUnits)
                return {
                    value: option,
                    label: `${byteValue.value} ${byteValue.unit.unit}`
                }
            }) || [];
    }

    function saveValidConfigurationAsUserConfig() {
        if (validateUserConfiguration(assetConfiguration!, configurableUserConfiguration)) {
            saveUserTestConfiguration(configurableUserConfiguration)
        }
    }

    function restoreUserConfigFromPersistedVersion() {
        setConfigurableUserConfiguration(userTestConfiguration!)
    }

    function restoreUserConfigDefaults() {
        setConfigurableUserConfiguration(buildDefaultSpeedtestUserConfiguration(assetConfiguration!))
    }

    if (!readyToRender) {
        return (<></>)
    }

    return (
        <Box className="speedtest-configurator">
            <Grid2 container spacing={1} columns={1}>

                <Grid2 size={1}>
                    <Paper elevation={5} className={"configurator-paper"}>
                        <Grid2 container spacing={2} columns={3}>
                            <Grid2 size={1} className={"center-align"}>
                                <Typography>Save Changes</Typography>
                                <IconButton onClick={() => saveValidConfigurationAsUserConfig()}>
                                    <SaveIcon/>
                                </IconButton>
                            </Grid2>
                            <Grid2 size={1} className={"center-align"}>
                                <Typography>Reload From Current</Typography>
                                <IconButton onClick={() => restoreUserConfigFromPersistedVersion()}>
                                    <HistoryIcon/>
                                </IconButton>
                            </Grid2>
                            <Grid2 size={1} className={"center-align"}>
                                <Typography>Restore Defaults</Typography>
                                <IconButton onClick={() => restoreUserConfigDefaults()}>
                                    <RotateLeftIcon/>
                                </IconButton>
                            </Grid2>
                        </Grid2>
                    </Paper>
                </Grid2>

                <Grid2 size={1}>
                    <Paper elevation={5} className={"configurator-paper"}>
                        <Grid2 container spacing={2} columns={1}>
                            <Grid2 size={1}>
                                Display
                            </Grid2>
                            <Grid2>

                            </Grid2>
                            <Grid2 container spacing={2} columns={2} size={1}>
                                <Grid2 size={1} className={"center-align"}>
                                    <Typography>
                                        Binary
                                        <InputSwitch id={"format-using-si-values"}
                                                     value={configurableUserConfiguration.display.useSIUnits}
                                                     onValueChange={value => {
                                                         setConfigurableUserConfiguration({
                                                             ...configurableUserConfiguration,
                                                             display: {
                                                                 ...configurableUserConfiguration.display,
                                                                 useSIUnits: value,
                                                                 useFixedUnit: getDefaultDataUnit(value, configurableUserConfiguration.display.useByteUnits).id
                                                             }
                                                         })
                                                     }}
                                        />
                                        SI
                                    </Typography>
                                    <Typography>
                                        Bit
                                        <InputSwitch id={"format-using-bit-values"}
                                                     value={configurableUserConfiguration.display.useByteUnits}
                                                     onValueChange={value => {
                                                         setConfigurableUserConfiguration({
                                                             ...configurableUserConfiguration,
                                                             display: {
                                                                 ...configurableUserConfiguration.display,
                                                                 useByteUnits: value,
                                                                 useFixedUnit: getDefaultDataUnit(configurableUserConfiguration.display.useSIUnits, value).id
                                                             }
                                                         })
                                                     }}
                                        />
                                        Byte
                                    </Typography>
                                </Grid2>
                                <Grid2 size={1} className={"center-align"}>
                                    <Typography>
                                        Unit Selection
                                    </Typography>
                                    <InputSelect id={"format-using-data-unit"}
                                                 value={configurableUserConfiguration.display.useFixedUnit}
                                                 availableValues={DataUnit.unitCollection(configurableUserConfiguration.display.useSIUnits, configurableUserConfiguration.display.useByteUnits).map(unit => {
                                                     return {key: `${unit.id} (${unit.unit})`, value: unit?.id}
                                                 })}
                                                 onValueChange={value => {
                                                     setConfigurableUserConfiguration({
                                                         ...configurableUserConfiguration,
                                                         display: {
                                                             ...configurableUserConfiguration.display,
                                                             useFixedUnit: value
                                                         }
                                                     })
                                                 }}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>
                    </Paper>
                </Grid2>

                <Grid2 size={1}>
                    <Paper elevation={5} className={"configurator-paper"}>
                        <Grid2 container spacing={2} columns={1}>
                            <Grid2 size={1}>
                                Latency
                                <InputSwitch id={"enable-latency-test"}
                                             value={configurableUserConfiguration?.latency.enabled}
                                             onValueChange={value => {
                                                 setConfigurableUserConfiguration({
                                                     ...configurableUserConfiguration,
                                                     latency: {
                                                         ...configurableUserConfiguration.latency,
                                                         enabled: value
                                                     }
                                                 })
                                             }}
                                />
                            </Grid2>
                            <Grid2 size={1}>
                                <InputText id={"latency-max-amount"}
                                           label={"max. Request Amount"}
                                           type={"number"}
                                           disabled={!configurableUserConfiguration?.latency.enabled}
                                           value={configurableUserConfiguration?.latency.maxRequests}
                                           onValueChange={(value: string) => {
                                               setConfigurableUserConfiguration({
                                                   ...configurableUserConfiguration,
                                                   latency: {
                                                       ...configurableUserConfiguration.latency,
                                                       maxRequests: Number.parseInt(value)
                                                   }
                                               })
                                           }}
                                />
                            </Grid2>
                            <Grid2 size={1}>
                                <InputText id={"latency-max-duration"}
                                           label={"max. Request Duration (ms)"}
                                           type={"number"}
                                           disabled={!configurableUserConfiguration?.latency.enabled}
                                           value={configurableUserConfiguration?.latency.maxDuration}
                                           onValueChange={(value: string) => {
                                               setConfigurableUserConfiguration({
                                                   ...configurableUserConfiguration,
                                                   latency: {
                                                       ...configurableUserConfiguration.latency,
                                                       maxDuration: Number.parseInt(value)
                                                   }
                                               })
                                           }}
                                />
                            </Grid2>
                        </Grid2>
                    </Paper>
                </Grid2>

                <Grid2 size={1}>
                    <Paper elevation={5} className={"configurator-paper"}>
                        <Grid2 container spacing={2} columns={1}>
                            <Grid2 size={1}>
                                Download
                                <InputSwitch id={"enable-download-test"}
                                             value={configurableUserConfiguration?.download.enabled}
                                             onValueChange={value => {
                                                 setConfigurableUserConfiguration({
                                                     ...configurableUserConfiguration,
                                                     download: {
                                                         ...configurableUserConfiguration.download,
                                                         enabled: value
                                                     }
                                                 })
                                             }}
                                />
                            </Grid2>
                            <Grid2 size={1}>
                                <NormalInputSlider id={"download-payload-size"}
                                                   min={getAvailablePayloadSizeMarks()[0]?.value}
                                                   max={getAvailablePayloadSizeMarks()[getAvailablePayloadSizeMarks().length - 1]?.value}
                                                   step={null}
                                                   marks={getAvailablePayloadSizeMarks()}
                                                   disabled={!configurableUserConfiguration?.download.enabled}
                                                   value={configurableUserConfiguration?.download.payloadByteSize}
                                                   onValueChange={(value) => {
                                                       setConfigurableUserConfiguration({
                                                           ...configurableUserConfiguration,
                                                           download: {
                                                               ...configurableUserConfiguration.download,
                                                               payloadByteSize: value
                                                           }
                                                       })
                                                   }}
                                />
                            </Grid2>
                            <Grid2 size={1}>
                                <InputText id={"download-max-amount"}
                                           label={"max. Request Amount"}
                                           type={"number"}
                                           disabled={!configurableUserConfiguration?.download.enabled}
                                           value={configurableUserConfiguration?.download.maxRequests}
                                           onValueChange={(value: string) => {
                                               setConfigurableUserConfiguration({
                                                   ...configurableUserConfiguration,
                                                   download: {
                                                       ...configurableUserConfiguration.download,
                                                       maxRequests: Number.parseInt(value)
                                                   }
                                               })
                                           }}
                                />
                            </Grid2>
                            <Grid2 size={1}>
                                <InputText id={"download-max-duration"}
                                           label={"max. Request Duration (ms)"}
                                           type={"number"}
                                           disabled={!configurableUserConfiguration?.download.enabled}
                                           value={configurableUserConfiguration?.download.maxDuration}
                                           onValueChange={(value: string) => {
                                               setConfigurableUserConfiguration({
                                                   ...configurableUserConfiguration,
                                                   download: {
                                                       ...configurableUserConfiguration.download,
                                                       maxDuration: Number.parseInt(value)
                                                   }
                                               })
                                           }}
                                />
                            </Grid2>
                        </Grid2>
                    </Paper>
                </Grid2>

                <Grid2 size={1}>
                    <Paper elevation={5} className={"configurator-paper"}>
                        <Grid2 container spacing={2} columns={1}>
                            <Grid2 size={1}>
                                Upload
                                <InputSwitch id={"enable-upload-test"}
                                             value={configurableUserConfiguration?.upload.enabled}
                                             onValueChange={value => {
                                                 setConfigurableUserConfiguration({
                                                     ...configurableUserConfiguration,
                                                     upload: {
                                                         ...configurableUserConfiguration.upload,
                                                         enabled: value
                                                     }
                                                 })
                                             }}
                                />
                            </Grid2>
                            <Grid2 size={1}>
                                <NormalInputSlider id={"upload-payload-size"}
                                                   min={getAvailablePayloadSizeMarks()[0]?.value}
                                                   max={getAvailablePayloadSizeMarks()[getAvailablePayloadSizeMarks().length - 1]?.value}
                                                   step={null}
                                                   marks={getAvailablePayloadSizeMarks()}
                                                   disabled={!configurableUserConfiguration?.upload.enabled}
                                                   value={configurableUserConfiguration?.upload.payloadByteSize}
                                                   onValueChange={(value) => {
                                                       setConfigurableUserConfiguration({
                                                           ...configurableUserConfiguration,
                                                           upload: {
                                                               ...configurableUserConfiguration.upload,
                                                               payloadByteSize: value
                                                           }
                                                       })
                                                   }}
                                />
                            </Grid2>
                            <Grid2 size={1}>
                                <InputText id={"upload-max-amount"}
                                           label={"max. Request Amount"}
                                           type={"number"}
                                           disabled={!configurableUserConfiguration?.upload.enabled}
                                           value={configurableUserConfiguration?.upload.maxRequests}
                                           onValueChange={(value: string) => {
                                               setConfigurableUserConfiguration({
                                                   ...configurableUserConfiguration,
                                                   upload: {
                                                       ...configurableUserConfiguration.upload,
                                                       maxRequests: Number.parseInt(value)
                                                   }
                                               })
                                           }}
                                />
                            </Grid2>
                            <Grid2 size={1}>
                                <InputText id={"upload-max-duration"}
                                           label={"max. Request Duration (ms)"}
                                           type={"number"}
                                           disabled={!configurableUserConfiguration?.upload.enabled}
                                           value={configurableUserConfiguration?.upload.maxDuration}
                                           onValueChange={(value: string) => {
                                               setConfigurableUserConfiguration({
                                                   ...configurableUserConfiguration,
                                                   upload: {
                                                       ...configurableUserConfiguration.upload,
                                                       maxDuration: Number.parseInt(value)
                                                   }
                                               })
                                           }}
                                />
                            </Grid2>
                        </Grid2>
                    </Paper>
                </Grid2>
            </Grid2>
        </Box>
    )
}