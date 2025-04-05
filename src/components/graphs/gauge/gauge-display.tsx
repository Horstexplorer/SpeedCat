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
        speed?: number
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
                    speed: properties.visualProperties?.animation?.speed
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
        <Box id={properties.id}
             className={properties.className ? `gauge-display ${properties.className}` : "gauge-display"}>
            <Box className={"gauge-overlay"}>
                <Box className={"gauge-overlay-content"}>
                    {properties.overlayText}
                </Box>
            </Box>
            <Paper className={"gauge-paper"} elevation={5}>
                <Chart
                    type={"radialBar"}
                    options={options}
                    series={properties.data.map(entry => entry.percentage)}
                    height={"100%"}
                />
            </Paper>
        </Box>
    )

}