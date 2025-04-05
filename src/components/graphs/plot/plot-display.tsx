import "./plot-display.scss"
import Chart from "react-apexcharts"

import {Box, Paper, Stack} from "@mui/material"
import {ApexOptions} from "apexcharts";

export interface IPlotDisplayData {
    name: string
    data: number[]
}

export interface IPlotDisplayVisualProperties {
    animation?: {
        enabled?: boolean,
        speed?: number
    }
}

export interface IPlotDisplayProperties {
    id?: string
    className?: string
    title?: string

    overlayText?: string
    data: IPlotDisplayData[]

    visualProperties?: IPlotDisplayVisualProperties
}

export default function PlotDisplay(properties: IPlotDisplayProperties){

    const noShow = {show: false}
    const disabled = {enabled: false}
    const noFilter = {filter: {type: 'none'}}

    const options: ApexOptions = {
        chart: {
            type: "area",
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
        tooltip: disabled,
        states: {
            hover: noFilter,
            active: noFilter
        },
        stroke: {
            curve: "smooth"
        },
        xaxis: {
            tickPlacement: "off",
            labels: noShow
        },
        yaxis: {
            labels: noShow
        }
    }

    return (
        <Paper
            id={properties.id}
            className={properties.className ? `plot-display ${properties.className}` : "plot-display"}
            elevation={5}>
            <Box className={"plot-overlay"}>
                {properties.overlayText}
            </Box>
            <Stack className={"plot-stack"}>
                {
                    properties.title ?
                        <Box className={"plot-title"}>
                            {properties.title}
                        </Box> : <></>
                }

                <Chart
                    className={"plot-graph"}
                    type={"line"}
                    options={options}
                    series={properties.data}
                    height={"100%"}
                />
            </Stack>
        </Paper>
    )
}