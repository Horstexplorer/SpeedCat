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

    const [gaugeValue, setGaugeValue] = useState<number[]>([0,0])
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
        setGaugeValue([0, 0])
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
                setDownloadResults(previous => {
                    if (previous.length > 0)
                        return [...previous, downloadResult]
                    return [{ samples: 0, averageDataPerSecond: new Value(0, DataUnits.BYTE) }, downloadResult]
                })
                const displayValue = unitActions.convert(downloadResult.averageDataPerSecond)
                setGaugeOverlayText(displayValue.toString())
                setGaugeValue([(displayValue.value / 10), 0])

                downloadChangeDeltaBuffer = []
            } else if (uploadChangeDeltaBuffer.length > 0) {
                const uploadResult = calculateSpeedCalculationResult(uploadChangeDeltaBuffer)
                setUploadResults(previous => {
                    if (previous.length > 0)
                        return [...previous, uploadResult]
                    return [{ samples: 0, averageDataPerSecond: new Value(0, DataUnits.BYTE) }, uploadResult]
                })
                const displayValue = unitActions.convert(uploadResult.averageDataPerSecond)
                setGaugeOverlayText(displayValue.toString())
                setGaugeValue(previous => [previous[0], (displayValue.value / 10)])

                uploadChangeDeltaBuffer = []
            }
        }
        const updateLoop = setInterval(() => doPerformUpdate(), 250)

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

        setGaugeOverlayText(undefined)
        setTestRunning(false)
    }

    return (
        <Box className="speedtest-page">
            <Stack spacing={2}>
                <GaugeDisplay
                    className={"speed-display"}
                    overlayText={gaugeOverlayText}
                    data={[
                        {
                            name: "Download",
                            percentage: gaugeValue[0]
                        },
                        {
                            name: "Upload",
                            percentage: gaugeValue[1]
                        }
                    ]}
                />
                <Stack direction={"row"} spacing={1}>
                    <PlotDisplay
                        className={"download-display"}
                        title={"Download"}

                        overlayText={downloadOverlayText}
                        data={[
                            {
                                name: "Download",
                                data: downloadResults.map(value => value.averageDataPerSecond.value)
                            }
                        ]}
                    />
                    <ScatterDisplay
                        className={"latency-display"}
                        title={"Latency"}
                        overlayText={latencyOverlayText}
                        data={[
                            {
                                name: "Latency",
                                data: latencyMeasurements.map(value => [value.timestamp, value.latency])
                            }
                        ]}
                    />
                    <PlotDisplay
                        className={"upload-display"}
                        title={"Upload"}
                        overlayText={uploadOverlayText}
                        data={[
                            {
                                name: "Upload",
                                data: uploadResults.map(value => value.averageDataPerSecond.value)
                            }
                        ]}
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