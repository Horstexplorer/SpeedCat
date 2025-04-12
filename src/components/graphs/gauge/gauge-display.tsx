import "./gauge-display.scss"
import {Box, Paper} from "@mui/material"
import Chart from "react-apexcharts";
import {ApexOptions} from "apexcharts";

export interface IDisplayGaugeData {
    name: string
    percentage: number
}

export interface IDisplayGaugeVisualProperties {
    animation?: {
        enabled?: boolean,
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
                series={properties.data.map(entry => entry.percentage)}
                height={"100%"}
            />
        </Paper>
    )

}