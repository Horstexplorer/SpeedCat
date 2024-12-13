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
import useDisplayConfigurationStore from "../../../../api/state/display-configuration-state.ts";
import {ILatencyCalculationResult, ILatencyMeasurement} from "../../../../api/speedtest/calc/latency-calculation.ts";
import {ISpeedCalculationResult, ISpeedChangeDelta} from "../../../../api/speedtest/calc/speed-calculation.ts";

export default function SpeedtestPage() {

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

    function setDefault() {
        setGaugeValue(undefined)
        setGaugeOverlayText("Test Not Running")
        setLatencyMsMeasurements([0,0])
        setLatencyOverlayText(undefined)
        setDownloadBpsMeasurements([0,0])
        setDownloadOverlayText(undefined)
        setUploadBpsMeasurements([0,0])
        setUploadOverlayText(undefined)
    }

    function setClear() {
        setGaugeValue(undefined)
        setGaugeOverlayText("Waiting")
        setLatencyMsMeasurements([0])
        setLatencyOverlayText(undefined)
        setDownloadBpsMeasurements([0])
        setDownloadOverlayText(undefined)
        setUploadBpsMeasurements([0])
        setUploadOverlayText(undefined)
    }

    function handleLatencyMeasurement(data: ILatencyMeasurement) {
        addLatencyMsMeasurement(data.latency)
    }

    function handleLatencyResult(data: ILatencyCalculationResult) {
        setLatencyOverlayText(`${data.latency}ms\n±${data.jitter}`)
    }

    function handleDownloadMeasurement(data: ISpeedChangeDelta) {
        addDownloadBpsMeasurement(data.deltaBytesPerSecond)
        const {useSIUnits, useByteUnits, useFixedUnit} = useDisplayConfigurationStore.getState()
        const displayValue = convertDataValue({value: data.deltaBytesPerSecond, unit: DataUnit.BYTE}, useFixedUnit, 2, useSIUnits, useByteUnits)
        setGaugeValue(displayValue.value)
        setGaugeOverlayText(`${displayValue.value} ${displayValue.unit.unit}/s`)
    }

    function handleDownloadResult(data: ISpeedCalculationResult) {
        const {useSIUnits, useByteUnits, useFixedUnit} = useDisplayConfigurationStore.getState()
        const displayValue = convertDataValue({value: data.averageBytesPerSecond, unit: DataUnit.BYTE}, useFixedUnit, 2, useSIUnits, useByteUnits)
        setDownloadOverlayText(`${displayValue.value} ${displayValue.unit.unit}/s`)
        setGaugeValue(undefined)
        setGaugeOverlayText(undefined)
    }

    function handleUploadMeasurement(data: ISpeedChangeDelta) {
        addUploadBpsMeasurement(data.deltaBytesPerSecond)
        const {useSIUnits, useByteUnits, useFixedUnit} = useDisplayConfigurationStore.getState()
        const displayValue = convertDataValue({value: data.deltaBytesPerSecond, unit: DataUnit.BYTE}, useFixedUnit, 2, useSIUnits, useByteUnits)
        setGaugeValue(displayValue.value)
        setGaugeOverlayText(`${displayValue.value} ${displayValue.unit.unit}/s`)
    }

    function handleUploadResult(data: ISpeedCalculationResult) {
        const {useSIUnits, useByteUnits, useFixedUnit} = useDisplayConfigurationStore.getState()
        const displayValue = convertDataValue({value: data.averageBytesPerSecond, unit: DataUnit.BYTE}, useFixedUnit, 2, useSIUnits, useByteUnits)
        setUploadOverlayText(`${displayValue.value} ${displayValue.unit.unit}/s`)
        setGaugeValue(undefined)
        setGaugeOverlayText(undefined)
    }

    const callbacks: ISpeedtestCallbacks = withDefaults({
        latency: {
            measurementCallbacks: [data => handleLatencyMeasurement(data)],
            resultCallbacks: [data => handleLatencyResult(data)]
        },
        download: {
            deltaCalculationCallbacks: [data => handleDownloadMeasurement(data)],
            resultCallbacks: [data => handleDownloadResult(data)]
        },
        upload: {
            deltaCalculationCallbacks: [data => handleUploadMeasurement(data)],
            resultCallbacks: [data => handleUploadResult(data)]
        }
    })
    const {assetConfiguration, setAssetConfiguration} = useAssetConfigurationStore()
    const {userConfiguration, saveUserConfiguration} = useUserConfigurationStore()
    const [speedtest, setSpeedtest] = useState<Speedtest>()
    const [readyToRender, setReadyToRender] = useState<boolean>(false)

    useEffect(() => {
        if (!assetConfiguration) {
            fetchAssetConfiguration().then(config => setAssetConfiguration(config))
        } else if (!userConfiguration) {
            saveUserConfiguration(buildDefaultSpeedtestUserConfiguration(assetConfiguration))
        } else {
            setSpeedtest(new Speedtest(buildSpeedtestConfigurationFrom(assetConfiguration, userConfiguration), withDefaults(callbacks)))
            setDefault()
            setReadyToRender(true)
        }
    }, [assetConfiguration, userConfiguration, readyToRender])

    async function startTest() {
        setClear()
        setTestRunning(true)
        await speedtest!.runTestSuit()
        setTestRunning(false)
        setGaugeOverlayText("Test Not Running")
    }

    return (
        <Box className="speedtest-page">
            <Grid2 container spacing={2} columns={5}>
                <Grid2 size={3} offset={1}>
                    <GaugeDisplay
                        className={"speed-display"}
                        currentValue={gaugeValue}
                        maxValue={1000}
                        overlayText={gaugeOverlayText}
                    />
                </Grid2>
                <Grid2 size={1} offset={1}>
                    <PlotDisplay
                        className={"download-display"}
                        title={"Download"}
                        overlayText={downloadOverlayText}
                        data={downloadBpsMeasurements}
                    />
                </Grid2>
                <Grid2 size={1}>
                    <PlotDisplay
                        className={"latency-display"}
                        title={"Latency"}
                        overlayText={latencyOverlayText}
                        data={latencyMsMeasurements}
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
                <Grid2 size={1} offset={2} className={"test-trigger"}>
                    {
                        !testIsRunning ?
                            <Button variant="contained" onClick={startTest}>
                                START
                            </Button> : <></>
                    }
                </Grid2>
            </Grid2>
        </Box>
    )
}