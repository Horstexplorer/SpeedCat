import "./plot-display.scss"
import Chart from "react-apexcharts"

import {Box, Grid2, Paper} from "@mui/material"
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
        <Box id={properties.id} className={properties.className ? `plot-display ${properties.className}` : "plot-display"}>
            <Box className={"plot-overlay"}>
                <Box className={"plot-overlay-content"}>
                    {properties.overlayText}
                </Box>
            </Box>
            <Paper className={"plot-paper"} elevation={5}>
                <Grid2 className={"plot-paper-grid"} container columns={1}>
                    {
                        properties.title ?
                            <Grid2 className={"plot-title"} size={1}>
                                {properties.title}
                            </Grid2> : <></>
                    }
                    <Grid2 className={"plot-graph"} size={1}>
                        <Chart
                            type={"line"}
                            options={options}
                            series={properties.data}
                            height={"100%"}
                        />
                    </Grid2>
                </Grid2>
            </Paper>
        </Box>
    )
}