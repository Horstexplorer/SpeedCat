import "./speedtest-page.scss"
import {Box, Button, Grid2} from "@mui/material"
import useTestFileConfigurationStore from "../../../../state/configuration/test-file-configuration-state.ts"
import useDataUnitStore from "../../../../state/configuration/data-unit-state.ts";
import useLatencyTestStore from "../../../../state/configuration/latency-test-state.ts";
import useDownloadSpeedTestStore from "../../../../state/configuration/download-speed-test-state.ts";
import useUploadSpeedTestStore from "../../../../state/configuration/upload-speed-test-state.ts";

export default function SpeedtestPage() {

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


    //
    // const [testIsRunning, setTestRunning] = useState<boolean>(false)
    // const [gaugeValue, setGaugeValue] = useState<number | undefined>()
    // const [gaugeOverlayText, setGaugeOverlayText] = useState<string | undefined>()
    // const [latencyMsMeasurements, setLatencyMsMeasurements] = useState<number[]>([])
    //
    // function addLatencyMsMeasurement(value: number) {
    //     setLatencyMsMeasurements(prevState => [...prevState, value])
    // }
    //
    // const [latencyOverlayText, setLatencyOverlayText] = useState<string | undefined>()
    // const [downloadBpsMeasurements, setDownloadBpsMeasurements] = useState<number[]>([])
    //
    // function addDownloadBpsMeasurement(value: number) {
    //     setDownloadBpsMeasurements(prevState => [...prevState, value])
    // }
    //
    // const [downloadOverlayText, setDownloadOverlayText] = useState<string | undefined>()
    // const [uploadBpsMeasurements, setUploadBpsMeasurements] = useState<number[]>([])
    //
    // function addUploadBpsMeasurement(value: number) {
    //     setUploadBpsMeasurements(prevState => [...prevState, value])
    // }
    //
    // const [uploadOverlayText, setUploadOverlayText] = useState<string | undefined>()
    //
    // function handleLatencyMeasurement(data: ILatencyMeasurement) {
    //     addLatencyMsMeasurement(data.latency)
    // }
    //
    // function handleLatencyResult(data: ILatencyCalculationResult) {
    //     setLatencyOverlayText(`${data.latency}ms\n±${data.jitter}`)
    // }
    //
    // function handleDownloadMeasurement(data: ISpeedChangeDelta) {
    //     addDownloadBpsMeasurement(data.deltaBytesPerSecond)
    //     const displayValue = convertDataValue({value: data.deltaBytesPerSecond, unit: DataUnit.BYTE},
    //         DataUnit.ofId(userTestConfiguration?.display.useFixedUnit), 2, userTestConfiguration?.display.useSIUnits, userTestConfiguration?.display.useByteUnits)
    //     setGaugeValue(displayValue.value)
    //     setGaugeOverlayText(`${displayValue.value} ${displayValue.unit.unit}/s`)
    // }
    //
    // function handleDownloadResult(data: ISpeedCalculationResult) {
    //     const displayValue = convertDataValue({value: data.averageBytesPerSecond, unit: DataUnit.BYTE},
    //         DataUnit.ofId(userTestConfiguration?.display.useFixedUnit), 2, userTestConfiguration?.display.useSIUnits, userTestConfiguration?.display.useByteUnits)
    //     setDownloadOverlayText(`${displayValue.value} ${displayValue.unit.unit}/s`)
    //     setGaugeValue(undefined)
    //     setGaugeOverlayText(undefined)
    // }
    //
    // function handleUploadMeasurement(data: ISpeedChangeDelta) {
    //     addUploadBpsMeasurement(data.deltaBytesPerSecond)
    //     const displayValue = convertDataValue({value: data.deltaBytesPerSecond, unit: DataUnit.BYTE},
    //         DataUnit.ofId(userTestConfiguration?.display.useFixedUnit), 2, userTestConfiguration?.display.useSIUnits, userTestConfiguration?.display.useByteUnits)
    //     setGaugeValue(displayValue.value)
    //     setGaugeOverlayText(`${displayValue.value} ${displayValue.unit.unit}/s`)
    // }
    //
    // function handleUploadResult(data: ISpeedCalculationResult) {
    //     const displayValue = convertDataValue({value: data.averageBytesPerSecond, unit: DataUnit.BYTE},
    //         DataUnit.ofId(userTestConfiguration?.display.useFixedUnit), 2, userTestConfiguration?.display.useSIUnits, userTestConfiguration?.display.useByteUnits)
    //     setUploadOverlayText(`${displayValue.value} ${displayValue.unit.unit}/s`)
    //     setGaugeValue(undefined)
    //     setGaugeOverlayText(undefined)
    // }
    //
    // function resetTestResults() {
    //     setGaugeValue(undefined)
    //     setGaugeOverlayText(undefined)
    //     setLatencyMsMeasurements([])
    //     setLatencyOverlayText(undefined)
    //     setDownloadBpsMeasurements([])
    //     setDownloadOverlayText(undefined)
    //     setUploadBpsMeasurements([])
    //     setUploadOverlayText(undefined)
    // }
    //
    // async function runSpeedTest() {
    //     setTestRunning(true)
    //     resetTestResults()
    //     await speedtest!.runTestSuit()
    //     setTestRunning(false)
    // }

    return (
        <Box className="speedtest-page">
            {/*<Grid2 container spacing={2} columns={1}>*/}
            {/*    <Grid2 size={1} >*/}
            {/*        <GaugeDisplay*/}
            {/*            className={"speed-display"}*/}
            {/*            currentValue={gaugeValue}*/}
            {/*            maxValue={1000}*/}
            {/*            overlayText={gaugeOverlayText}*/}
            {/*        />*/}
            {/*    </Grid2>*/}
            {/*    <Grid2 container columns={3} size={1}>*/}
            {/*        <Grid2 size={1}>*/}
            {/*            <PlotDisplay*/}
            {/*                className={"download-display"}*/}
            {/*                title={"Download"}*/}
            {/*                overlayText={downloadOverlayText}*/}
            {/*                data={downloadBpsMeasurements}*/}
            {/*            />*/}
            {/*        </Grid2>*/}
            {/*        <Grid2 size={1}>*/}
            {/*            <ScatterDisplay*/}
            {/*                className={"latency-display"}*/}
            {/*                title={"Latency"}*/}
            {/*                overlayText={latencyOverlayText}*/}
            {/*                data={{latency: latencyMsMeasurements}}*/}
            {/*            />*/}
            {/*        </Grid2>*/}
            {/*        <Grid2 size={1}>*/}
            {/*            <PlotDisplay*/}
            {/*                className={"upload-display"}*/}
            {/*                title={"Upload"}*/}
            {/*                overlayText={uploadOverlayText}*/}
            {/*                data={uploadBpsMeasurements}*/}
            {/*            />*/}
            {/*        </Grid2>*/}
            {/*    </Grid2>*/}
            {/*    <Grid2 size={1} className={"test-trigger"}>*/}
            {/*        {*/}
            {/*            !testIsRunning ?*/}
            {/*                <Button variant="contained" onClick={runSpeedTest}>*/}
            {/*                    START*/}
            {/*                </Button> : <></>*/}
            {/*        }*/}
            {/*    </Grid2>*/}
            {/*</Grid2>*/}
        </Box>
    )
}