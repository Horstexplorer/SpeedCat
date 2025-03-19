import "./scatter-display.scss"
import {Box, Grid2, Paper} from "@mui/material"
import Chart from "react-apexcharts";
import {ApexOptions} from "apexcharts";

export interface IScatterDisplayData {
    name: string
    data: number[] | number[][]
}

export interface IScatterDisplayVisualProperties {
    animation?: {
        enabled?: boolean,
        speed?: number
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
                    speed: properties.visualProperties?.animation?.speed
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
        <Box id={properties.id} className={properties.className ? `scatter-display ${properties.className}` : "scatter-display"}>
            <Box className={"scatter-overlay"}>
                <Box className={"scatter-overlay-content"}>
                    {properties.overlayText}
                </Box>
            </Box>
            <Paper className={"scatter-paper"} elevation={5}>
                <Grid2 className={"scatter-paper-grid"} container columns={1}>
                    {
                        properties.title ?
                            <Grid2 className={"scatter-title"} size={1}>
                                {properties.title}
                            </Grid2> : <></>
                    }
                    <Grid2 className={"scatter-graph"} size={1}>
                        <Chart
                            height={"100%"}
                            options={options}
                            series={properties.data}
                            type={"scatter"}
                        />
                    </Grid2>
                </Grid2>
            </Paper>
        </Box>
    )
}