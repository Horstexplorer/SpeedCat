import "./plot-display.scss"
import {Area, AreaChart, CartesianGrid, ResponsiveContainer} from "recharts";
import {Box, Grid2, Paper} from "@mui/material";

export interface IPlotDisplayProperties {
    id?: string
    className?: string
    title?: string
    overlayText?: string
    data: number[]
}

export default function PlotDisplay(properties: IPlotDisplayProperties){

    function toToChartData(data: any[]): { key: any, value: any }[] {
        return data.map((value, index) => {
            return {key: index, value: value}
        })
    }

    const uid = Math.random()

    return (
        <Box id={properties.id} className={properties.className ? "plot-display " + properties.className : "plot-display"}>
            <Box className={"plot-overlay"}>
                <Box className={"plot-overlay-content"}>
                    <h3>{properties.overlayText}</h3>
                </Box>
            </Box>
            <Paper className={"plot-paper"} elevation={5}>
                <Grid2 container columns={1}>
                    <Grid2 className={"plot-title"} size={1}>
                        <h4>{properties.title}</h4>
                    </Grid2>
                    <Grid2 className={"plot-graph"} size={1}>
                        <ResponsiveContainer>
                            <AreaChart data={toToChartData(properties.data)}>
                                <defs>
                                    <linearGradient id={"plot-gradient-"+uid} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--graph-color)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--graph-color)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                {properties.data.length > 0 ? <CartesianGrid strokeDasharray="3 3" /> : <></>}
                                <Area type="monotone" dataKey={"value"} stroke={"var(--graph-color)"} fill={"url(#plot-gradient-" + uid + ")"}/>
                            </AreaChart>
                        </ResponsiveContainer>
                    </Grid2>
                </Grid2>
            </Paper>
        </Box>
    )
}