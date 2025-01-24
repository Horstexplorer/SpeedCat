import "./speedtest-page.scss"
import {Box, Button, Grid2} from "@mui/material";
import {useEffect, useState} from "react";
import useUserConfigurationStore from "../../../../api/state/user-configuration-state.ts";
import useAssetConfigurationStore from "../../../../api/state/asset-configuration-state.ts";
import {fetchAssetConfiguration} from "../../../../api/speedtest-assets/asset-configuration.ts";
import {
    buildDefaultSpeedtestUserConfiguration, buildSpeedtestConfigurationFrom
} from "../../../../api/speedtest-user-configuration/user-configuration-builder.ts";
import Speedtest, {ISpeedtestCallbacks, withDefaults} from "../../../../api/speedtest/speedtest.ts";
import PlotDisplay from "../../../display/plot/plot-display.tsx";
import GaugeDisplay from "../../../display/gauge/gauge-display.tsx";
import {convertDataValue, DataUnit} from "../../../../api/misc/data-unit-conversion.ts";
import {ILatencyCalculationResult, ILatencyMeasurement} from "../../../../api/speedtest/calc/latency-calculation.ts";
import {ISpeedCalculationResult, ISpeedChangeDelta} from "../../../../api/speedtest/calc/speed-calculation.ts";
import ScatterDisplay from "../../../display/scatter/scatter-display.tsx";

export default function SpeedtestPage() {

    const {assetConfiguration, setAssetConfiguration} = useAssetConfigurationStore()
    const {userTestConfiguration, saveUserTestConfiguration} = useUserConfigurationStore()
    const [speedtest, setSpeedtest] = useState<Speedtest>()
    const [readyToRender, setReadyToRender] = useState<boolean>(false)

    useEffect(() => {
        if (!assetConfiguration) {
            fetchAssetConfiguration().then(config => setAssetConfiguration(config))
        } else if (!userTestConfiguration) {
            saveUserTestConfiguration(buildDefaultSpeedtestUserConfiguration(assetConfiguration))
        } else {
            setSpeedtest(new Speedtest(buildSpeedtestConfigurationFrom(assetConfiguration, userTestConfiguration), withDefaults(getSpeedtestCallbacks())))
            setReadyToRender(true)
        }
    }, [assetConfiguration, userTestConfiguration, readyToRender])

    function getSpeedtestCallbacks(): ISpeedtestCallbacks {
        return {
            latency: {
                preHook: _ => userTestConfiguration!.latency.enabled,
                test: {
                    measurementCallbacks: [data => handleLatencyMeasurement(data)],
                    resultCallbacks: [data => handleLatencyResult(data)]
                }
            },
            download: {
                preHook: _ => userTestConfiguration!.download.enabled,
                test: {
                    deltaCalculationCallbacks: [data => handleDownloadMeasurement(data)],
                    resultCallbacks: [data => handleDownloadResult(data)]
                }
            },
            upload: {
                preHook: _ => userTestConfiguration!.upload.enabled,
                test: {
                    deltaCalculationCallbacks: [data => handleUploadMeasurement(data)],
                    resultCallbacks: [data => handleUploadResult(data)]
                }
            }
        }
    }

    const [testIsRunning, setTestRunning] = useState<boolean>(false)
    const [gaugeValue, setGaugeValue] = useState<number | undefined>()
    const [gaugeOverlayText, setGaugeOverlayText] = useState<string | undefined>()
    const [latencyMsMeasurements, setLatencyMsMeasurements] = useState<number[]>([])

    function addLatencyMsMeasurement(value: number) {
        setLatencyMsMeasurements(prevState => [...prevState, value])
    }

    const [latencyOverlayText, setLatencyOverlayText] = useState<string | undefined>()
    const [downloadBpsMeasurements, setDownloadBpsMeasurements] = useState<number[]>([])

    function addDownloadBpsMeasurement(value: number) {
        setDownloadBpsMeasurements(prevState => [...prevState, value])
    }

    const [downloadOverlayText, setDownloadOverlayText] = useState<string | undefined>()
    const [uploadBpsMeasurements, setUploadBpsMeasurements] = useState<number[]>([])

    function addUploadBpsMeasurement(value: number) {
        setUploadBpsMeasurements(prevState => [...prevState, value])
    }

    const [uploadOverlayText, setUploadOverlayText] = useState<string | undefined>()

    function handleLatencyMeasurement(data: ILatencyMeasurement) {
        addLatencyMsMeasurement(data.latency)
    }

    function handleLatencyResult(data: ILatencyCalculationResult) {
        setLatencyOverlayText(`${data.latency}ms\n±${data.jitter}`)
    }

    function handleDownloadMeasurement(data: ISpeedChangeDelta) {
        addDownloadBpsMeasurement(data.deltaBytesPerSecond)
        const displayValue = convertDataValue({value: data.deltaBytesPerSecond, unit: DataUnit.BYTE},
            DataUnit.ofId(userTestConfiguration?.display.useFixedUnit), 2, userTestConfiguration?.display.useSIUnits, userTestConfiguration?.display.useByteUnits)
        setGaugeValue(displayValue.value)
        setGaugeOverlayText(`${displayValue.value} ${displayValue.unit.unit}/s`)
    }

    function handleDownloadResult(data: ISpeedCalculationResult) {
        const displayValue = convertDataValue({value: data.averageBytesPerSecond, unit: DataUnit.BYTE},
            DataUnit.ofId(userTestConfiguration?.display.useFixedUnit), 2, userTestConfiguration?.display.useSIUnits, userTestConfiguration?.display.useByteUnits)
        setDownloadOverlayText(`${displayValue.value} ${displayValue.unit.unit}/s`)
        setGaugeValue(undefined)
        setGaugeOverlayText(undefined)
    }

    function handleUploadMeasurement(data: ISpeedChangeDelta) {
        addUploadBpsMeasurement(data.deltaBytesPerSecond)
        const displayValue = convertDataValue({value: data.deltaBytesPerSecond, unit: DataUnit.BYTE},
            DataUnit.ofId(userTestConfiguration?.display.useFixedUnit), 2, userTestConfiguration?.display.useSIUnits, userTestConfiguration?.display.useByteUnits)
        setGaugeValue(displayValue.value)
        setGaugeOverlayText(`${displayValue.value} ${displayValue.unit.unit}/s`)
    }

    function handleUploadResult(data: ISpeedCalculationResult) {
        const displayValue = convertDataValue({value: data.averageBytesPerSecond, unit: DataUnit.BYTE},
            DataUnit.ofId(userTestConfiguration?.display.useFixedUnit), 2, userTestConfiguration?.display.useSIUnits, userTestConfiguration?.display.useByteUnits)
        setUploadOverlayText(`${displayValue.value} ${displayValue.unit.unit}/s`)
        setGaugeValue(undefined)
        setGaugeOverlayText(undefined)
    }

    function resetTestResults() {
        setGaugeValue(undefined)
        setGaugeOverlayText(undefined)
        setLatencyMsMeasurements([])
        setLatencyOverlayText(undefined)
        setDownloadBpsMeasurements([])
        setDownloadOverlayText(undefined)
        setUploadBpsMeasurements([])
        setUploadOverlayText(undefined)
    }

    async function runSpeedTest() {
        setTestRunning(true)
        resetTestResults()
        await speedtest!.runTestSuit()
        setTestRunning(false)
    }

    return (
        <Box className="speedtest-page">
            <Grid2 container spacing={2} columns={1}>
                <Grid2 size={1} >
                    <GaugeDisplay
                        className={"speed-display"}
                        currentValue={gaugeValue}
                        maxValue={1000}
                        overlayText={gaugeOverlayText}
                    />
                </Grid2>
                <Grid2 container columns={3} size={1}>
                    <Grid2 size={1}>
                        <PlotDisplay
                            className={"download-display"}
                            title={"Download"}
                            overlayText={downloadOverlayText}
                            data={downloadBpsMeasurements}
                        />
                    </Grid2>
                    <Grid2 size={1}>
                        <ScatterDisplay
                            className={"latency-display"}
                            title={"Latency"}
                            overlayText={latencyOverlayText}
                            data={{latency: latencyMsMeasurements}}
                        />
                    </Grid2>
                    <Grid2 size={1}>
                        <PlotDisplay
                            className={"upload-display"}
                            title={"Upload"}
                            overlayText={uploadOverlayText}
                            data={uploadBpsMeasurements}
                        />
                    </Grid2>
                </Grid2>
                <Grid2 size={1} className={"test-trigger"}>
                    {
                        !testIsRunning ?
                            <Button variant="contained" onClick={runSpeedTest}>
                                START
                            </Button> : <></>
                    }
                </Grid2>
            </Grid2>
        </Box>
    )
}