import "./speedtest-configurator.scss"
import {Box, Grid2, IconButton, Paper, Typography} from "@mui/material";
import useAssetConfigurationStore from "../../../../api/state/asset-configuration-state.ts";
import {useEffect, useState} from "react";
import useUserConfigurationStore from "../../../../api/state/user-configuration-state.ts";
import {
    buildDefaultSpeedtestUserConfiguration
} from "../../../../api/speedtest-user-configuration/user-configuration-builder.ts";
import InputText from "../../../input/text/input-text.tsx";
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import {fetchAssetConfiguration} from "../../../../api/speedtest-assets/asset-configuration.ts";
import {ISpeedtestUserConfiguration} from "../../../../api/speedtest-user-configuration/user-configuration.ts";
import NormalInputSlider from "../../../input/normal-slider/normal-input-slider.tsx";
import {validateUserConfiguration} from "../../../../api/speedtest-user-configuration/user-configuration-verification.ts";
import {convertDataValue, DataUnit} from "../../../../api/misc/data-unit-conversion.ts";
import useDisplayConfigurationStore from "../../../../api/state/display-configuration-state.ts";

export default function SpeedtestConfigurator() {

    const {assetConfiguration, setAssetConfiguration} = useAssetConfigurationStore();
    const {userConfiguration, saveUserConfiguration} = useUserConfigurationStore();
    const {useSIUnits, useByteUnits, useFixedUnit} = useDisplayConfigurationStore()
    const [configurableUserConfiguration, setConfigurableUserConfiguration] = useState<ISpeedtestUserConfiguration>(userConfiguration!)
    const [readyToRender, setReadyToRender] = useState<boolean>(false)

    useEffect(() => {
        if (!assetConfiguration) {
            fetchAssetConfiguration().then(config => setAssetConfiguration(config))
        } else if (!userConfiguration) {
            saveUserConfiguration(buildDefaultSpeedtestUserConfiguration(assetConfiguration))
        } else {
            setConfigurableUserConfiguration({...userConfiguration})
            setReadyToRender(true)
        }
    }, [assetConfiguration, userConfiguration, readyToRender]);

    function getAvailablePayloadSizeMarks(): { value: number, label: string }[] {
        return assetConfiguration?.getOrderedAvailablePayloadSizes()
            .map(option => {
                const byteValue = convertDataValue({value: option, unit: DataUnit.BYTE}, useFixedUnit, 2, useSIUnits, useByteUnits)
                return {
                    value: option,
                    label: `${byteValue.value} ${byteValue.unit.unit}`
                }
            }) || [];
    }

    function saveValidConfigurationAsUserConfig() {
        if (validateUserConfiguration(assetConfiguration!, configurableUserConfiguration)) {
            saveUserConfiguration(configurableUserConfiguration)
        }
    }

    function restoreUserConfigFromPersistedVersion() {
        setConfigurableUserConfiguration(userConfiguration!)
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
                        <Grid2 container spacing={2} columns={1}>
                            <Grid2 size={1}>
                                <Typography>Latency</Typography>
                            </Grid2>
                            <Grid2 size={1}>
                                <InputText id={"latency-max-amount"}
                                           label={"max. Request Amount"}
                                           type={"number"}
                                           value={configurableUserConfiguration?.latency.maxRequests}
                                           onValueChange={(value: string) => {
                                               setConfigurableUserConfiguration({...configurableUserConfiguration,
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
                                           value={configurableUserConfiguration?.latency.maxDuration}
                                           onValueChange={(value: string) => {
                                               setConfigurableUserConfiguration({...configurableUserConfiguration,
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
                                <Typography>Download</Typography>
                            </Grid2>
                            <Grid2 size={1}>
                                <NormalInputSlider id={"download-payload-size"}
                                                   min={getAvailablePayloadSizeMarks()[0]?.value}
                                                   max={getAvailablePayloadSizeMarks()[getAvailablePayloadSizeMarks().length - 1]?.value}
                                                   step={null}
                                                   marks={getAvailablePayloadSizeMarks()}
                                                   value={configurableUserConfiguration?.download.payloadByteSize}
                                                   onValueChange={(value) => {
                                                       setConfigurableUserConfiguration({...configurableUserConfiguration,
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
                                           value={configurableUserConfiguration?.download.maxRequests}
                                           onValueChange={(value: string) => {
                                               setConfigurableUserConfiguration({...configurableUserConfiguration,
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
                                           value={configurableUserConfiguration?.download.maxDuration}
                                           onValueChange={(value: string) => {
                                               setConfigurableUserConfiguration({...configurableUserConfiguration,
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
                                <Typography>Upload</Typography>
                            </Grid2>
                            <Grid2 size={1}>
                                <NormalInputSlider id={"upload-payload-size"}
                                                   min={getAvailablePayloadSizeMarks()[0]?.value}
                                                   max={getAvailablePayloadSizeMarks()[getAvailablePayloadSizeMarks().length - 1]?.value}
                                                   step={null}
                                                   marks={getAvailablePayloadSizeMarks()}
                                                   value={configurableUserConfiguration?.upload.payloadByteSize}
                                                   onValueChange={(value) => {
                                                       setConfigurableUserConfiguration({...configurableUserConfiguration,
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
                                           value={configurableUserConfiguration?.upload.maxRequests}
                                           onValueChange={(value: string) => {
                                               setConfigurableUserConfiguration({...configurableUserConfiguration,
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
                                           value={configurableUserConfiguration?.upload.maxDuration}
                                           onValueChange={(value: string) => {
                                               setConfigurableUserConfiguration({...configurableUserConfiguration,
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

                <Grid2 size={1}>
                    <Paper elevation={5} className={"configurator-paper"}>
                        <Grid2 container spacing={2} columns={3}>
                            <Grid2 size={1}>
                                <Typography>Save Changes</Typography>
                                <IconButton onClick={() => saveValidConfigurationAsUserConfig()}>
                                    <SaveIcon/>
                                </IconButton>
                            </Grid2>
                            <Grid2 size={1}>
                                <Typography>Reload From Current</Typography>
                                <IconButton onClick={() => restoreUserConfigFromPersistedVersion()}>
                                    <HistoryIcon/>
                                </IconButton>
                            </Grid2>
                            <Grid2 size={1}>
                                <Typography>Restore Defaults</Typography>
                                <IconButton onClick={() => restoreUserConfigDefaults()}>
                                    <RotateLeftIcon/>
                                </IconButton>
                            </Grid2>
                        </Grid2>
                    </Paper>
                </Grid2>
            </Grid2>
        </Box>
    )
}