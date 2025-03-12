import "./speedtest-page.scss"
import {Box, Button, Stack} from "@mui/material"
import useTestFileConfigurationStore from "../../../../state/configuration/test-file-configuration-state.ts"
import useDataUnitStore from "../../../../state/configuration/data-unit-state.ts";
import useLatencyTestStore from "../../../../state/configuration/latency-test-state.ts";
import useDownloadSpeedTestStore from "../../../../state/configuration/download-speed-test-state.ts";
import useUploadSpeedTestStore from "../../../../state/configuration/upload-speed-test-state.ts";
import GaugeDisplay from "../../../display/gauge/gauge-display.tsx";
import PlotDisplay from "../../../display/plot/plot-display.tsx";
import ScatterDisplay from "../../../display/scatter/scatter-display.tsx";
import {useState} from "react";
import LatencyTest from "../../../../api/speedtest/tests/latency/latency-test.ts";
import {ILatencyMeasurementEvent} from "../../../../api/speedtest/calculations/latency-calculation.ts";
import DownloadSpeedTest from "../../../../api/speedtest/tests/speed/download-speed-test.ts";
import {
    calculateSpeedCalculationResult, ISpeedCalculationResult,
    ISpeedChangeDeltaEvent
} from "../../../../api/speedtest/calculations/speed-calculation.ts";
import UploadSpeedTest from "../../../../api/speedtest/tests/speed/upload-speed-test.ts";
import {generateRandomData} from "../../../../api/misc/data-generator.ts";
import {DataUnits} from "../../../../api/misc/units/types/data-units.ts";
import Value from "../../../../api/misc/units/value.ts";

export default function SpeedtestPage() {

    const {_actions: unitActions} = useDataUnitStore()

    const {_ctrl: assetCtrl} = useTestFileConfigurationStore()
    if (!assetCtrl.readyToBeUsed)
        throw assetCtrl.bootstrap()

    const {enabled: latencyTestEnabled, method: latencyTestMethod, parameters: latencyTestParameters, _actions: latencyStateActions, _ctrl: latencyStoreControls} = useLatencyTestStore()
    if (!latencyStoreControls.readyToBeUsed)
        throw latencyStoreControls.bootstrap()

    const {enabled: downloadTestEnabled, parameters: downloadTestParameters, _actions: downloadStateActions, _ctrl: downloadStoreControls} = useDownloadSpeedTestStore()
    if (!downloadStoreControls.readyToBeUsed)
        throw downloadStoreControls.bootstrap()

    const {enabled: uploadTestEnabled, payloadSize: uploadPayloadSize, parameters: uploadTestParameters, _actions: uploadStateActions, _ctrl: uploadStoreControls} = useUploadSpeedTestStore()
    if (!uploadStoreControls.readyToBeUsed)
        throw uploadStoreControls.bootstrap()

    const latencyTest = new LatencyTest({
        method: latencyTestMethod,
        url: latencyStateActions.resolveTestFileDefinition()!.path,
        parameters: {
            minDelay: latencyTestParameters.minDelay,
            maxDuration: latencyTestParameters.maxDuration,
            maxRequests: latencyTestParameters.maxRequests
        }
    })

    const downloadTest = new DownloadSpeedTest({
        url: downloadStateActions.resolveTestFileDefinition()!.path,
        parameters: {
            minDelay: downloadTestParameters.minDelay,
            maxDuration: downloadTestParameters.maxDuration,
            maxRequests: downloadTestParameters.maxRequests
        }
    })

    const uploadTest = new UploadSpeedTest({
        url: uploadStateActions.resolveTestFileDefinition()!.path,
        payload: generateRandomData(Value.convert(uploadPayloadSize!, DataUnits.BYTE).value),
        parameters: {
            minDelay: uploadTestParameters.minDelay,
            maxDuration: uploadTestParameters.maxDuration,
            maxRequests: uploadTestParameters.maxRequests
        }
    })

    const [testIsRunning, setTestRunning] = useState<boolean>(false)

    const [gaugeValue, setGaugeValue] = useState<number | undefined>()
    const [gaugeOverlayText, setGaugeOverlayText] = useState<string | undefined>()

    const [latencyMeasurements, setLatencyMeasurements] = useState<ILatencyMeasurementEvent[]>([])
    const [latencyOverlayText, setLatencyOverlayText] = useState<string | undefined>()

    let downloadChangeDeltaBuffer: ISpeedChangeDeltaEvent[] = []
    const [downloadResults, setDownloadResults] = useState<ISpeedCalculationResult[]>([])
    const [downloadOverlayText, setDownloadOverlayText] = useState<string | undefined>()

    let uploadChangeDeltaBuffer: ISpeedChangeDeltaEvent[] = []
    const [uploadResults, setUploadResults] = useState<ISpeedCalculationResult[]>([])
    const [uploadOverlayText, setUploadOverlayText] = useState<string | undefined>()

    async function runTestSuite() {
        setTestRunning(true)
        setGaugeValue(undefined)
        setGaugeOverlayText(undefined)
        setLatencyMeasurements([])
        setLatencyOverlayText(undefined)
        downloadChangeDeltaBuffer = []
        setDownloadResults([])
        setDownloadOverlayText(undefined)
        uploadChangeDeltaBuffer = []
        setUploadResults([])
        setUploadOverlayText(undefined)

        function doPerformUpdate() {
            if (downloadChangeDeltaBuffer.length > 0) {
                const downloadResult= calculateSpeedCalculationResult(downloadChangeDeltaBuffer)
                setDownloadResults(previous => [...previous, downloadResult])
                setGaugeValue(unitActions.convert(downloadResult.averageDataPerSecond).value)
                setGaugeOverlayText(unitActions.convert(downloadResult.averageDataPerSecond).toString())
                downloadChangeDeltaBuffer = []
            } else if (uploadChangeDeltaBuffer.length > 0) {
                const uploadResult = calculateSpeedCalculationResult(uploadChangeDeltaBuffer)
                setUploadResults(previous => [...previous, uploadResult])
                setGaugeValue(unitActions.convert(uploadResult.averageDataPerSecond).value)
                setGaugeOverlayText(unitActions.convert(uploadResult.averageDataPerSecond).toString())
                uploadChangeDeltaBuffer = []
            }
        }
        const updateLoop = setInterval(() => doPerformUpdate(), 150)

        try {
            await latencyTest.run({
                controls: {
                    skip: !latencyTestEnabled
                },
                testRunInput: {
                    measurement: value => setLatencyMeasurements(previous => [...previous, value]),
                    result: value => setLatencyOverlayText(`${value.latency} ms ± ${value.jitter} ms`)
                }
            })
            await new Promise(resolve => setTimeout(resolve, 1000))
            await downloadTest.run({
                controls: {
                    skip: !downloadTestEnabled
                },
                testRunInput: {
                    changeDelta: value => downloadChangeDeltaBuffer.push(value),
                    result: value => setDownloadOverlayText(unitActions.convert(value.averageDataPerSecond).toString())
                }
            })
            await new Promise(resolve => setTimeout(resolve, 1000))
            await uploadTest.run({
                controls: {
                    skip: !uploadTestEnabled
                },
                testRunInput: {
                    changeDelta: value => uploadChangeDeltaBuffer.push(value),
                    result: value => setUploadOverlayText(unitActions.convert(value.averageDataPerSecond).toString())
                }
            })
        }catch (e) {
            console.error(e)
        }

        clearInterval(updateLoop)
        doPerformUpdate()

        setGaugeValue(undefined)
        setGaugeOverlayText(undefined)
        setTestRunning(false)
    }

    return (
        <Box className="speedtest-page">
            <Stack spacing={2}>
                <GaugeDisplay
                    className={"speed-display"}
                    currentValue={gaugeValue}
                    maxValue={1000}
                    overlayText={gaugeOverlayText}
                />
                <Stack direction={"row"} spacing={1}>
                    <PlotDisplay
                        className={"download-display"}
                        title={"Download"}
                        overlayText={downloadOverlayText}
                        data={[...downloadResults.map(value => value.averageDataPerSecond.value)]}
                    />
                    <ScatterDisplay
                        className={"latency-display"}
                        title={"Latency"}
                        overlayText={latencyOverlayText}
                        data={{latency: [...latencyMeasurements.map(value => value.latency)]}}
                    />
                    <PlotDisplay
                        className={"upload-display"}
                        title={"Upload"}
                        overlayText={uploadOverlayText}
                        data={[...uploadResults.map(value => value.averageDataPerSecond.value)]}
                    />
                </Stack>
                {
                    !testIsRunning ?
                        <Button className={"test-trigger"} variant="contained" onClick={runTestSuite}>
                            START
                        </Button>
                        : <></>
                }
            </Stack>

        </Box>
    )
}