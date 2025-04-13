import "./gauge-display.scss"
import {Box, Paper} from "@mui/material"
import Chart from "react-apexcharts";
import {ApexOptions} from "apexcharts";
import {clamp} from "../../../api/misc/clamp.ts";

export interface IDisplayGaugeData {
    name: string
    factor: number
}

export enum GaugeVisualScale {
    LINEAR,
    LOGARITHMIC
}

export interface IDisplayGaugeVisualProperties {
    scale?: GaugeVisualScale
    animation?: {
        enabled?: boolean
        interval?: number
    }
}

export interface IDisplayGaugeProperties {
    id?: string
    className?: string

    overlayText?: string
    data: IDisplayGaugeData[]

    visualProperties?: IDisplayGaugeVisualProperties
}

export default function GaugeDisplay(properties: IDisplayGaugeProperties) {

    const noShow = {show: false}
    const disabled = {enabled: false}
    const noFilter = {filter: {type: 'none'}}

    const options: ApexOptions = {
        chart: {
            type: "radialBar",
            toolbar: noShow,
            zoom: disabled,
            selection: disabled,
            animations: {
                enabled: properties.visualProperties?.animation?.enabled,
                dynamicAnimation: {
                    speed: properties.visualProperties?.animation?.interval
                }
            }
        },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                dataLabels: noShow
            }
        },
        stroke: {
            dashArray: 4,
        },
        tooltip: disabled,
        states: {
            hover: noFilter,
            active: noFilter
        },
        labels: properties.data.map(entry => entry.name)
    }

    function scaleFactor(value: number): number {
        const factor = clamp(value, 0, 1)
        switch (properties.visualProperties?.scale) {
            case GaugeVisualScale.LOGARITHMIC: {
                return scaleLogarithmic(factor)
            }
            default: {
                return factor
            }
        }
    }

    function scaleLogarithmic(factor: number) {
        if (factor == 0)
            return 0
        return Math.log10(factor * 100) / 2
    }

    return (
        <Paper
            id={properties.id}
            className={properties.className ? `gauge-display ${properties.className}` : "gauge-display"}
            elevation={5}
        >
            <Box className={"gauge-overlay"}>
                {properties.overlayText}
            </Box>
            <Chart
                className={"gauge-graph"}
                type={"radialBar"}
                options={options}
                series={properties.data.map(entry => scaleFactor(entry.factor) * 100)}
                height={"100%"}
            />
        </Paper>
    )

}