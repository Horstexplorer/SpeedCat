import "./scatter-display.scss"
import {Box, Paper, Stack} from "@mui/material"
import Chart from "react-apexcharts";
import {ApexOptions} from "apexcharts";

export interface IScatterDisplayData {
    name: string
    data: number[] | number[][]
}

export interface IScatterDisplayVisualProperties {
    animation?: {
        enabled?: boolean,
        interval?: number
    }
}

export interface IScatterDisplayProperties {
    id?: string
    className?: string
    title?: string

    overlayText?: string
    data: IScatterDisplayData[]

    visualProperties?: IScatterDisplayVisualProperties
}

export default function ScatterDisplay(properties: IScatterDisplayProperties) {

    const noShow = {show: false}
    const disabled = {enabled: false}
    const noFilter = {filter: {type: 'none'}}

    const options: ApexOptions = {
        chart: {
            type: "scatter",
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
        tooltip: disabled,
        states: {
            hover: noFilter,
            active: noFilter
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
            className={properties.className ? `scatter-display ${properties.className}` : "scatter-display"}
            elevation={5}>
            <Box className={"scatter-overlay"}>
                {properties.overlayText}
            </Box>
            <Stack className={"scatter-stack"}>
                {
                    properties.title ?
                        <Box className={"scatter-title"}>
                            {properties.title}
                        </Box> : <></>
                }
                <Chart
                    className={"scatter-chart"}
                    type={"scatter"}
                    options={options}
                    series={properties.data}
                    height={"100%"}
                />
            </Stack>
        </Paper>
    )
}