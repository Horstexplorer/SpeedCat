import "./scatter-display.scss"
import {Box, Grid2, Paper} from "@mui/material"
import {CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis} from "recharts"

export interface IScatterDisplayProperties {
    id?: string
    className?: string
    title?: string
    overlayText?: string
    data: {[key: string]: number[]}
}

export default function ScatterDisplay(properties: IScatterDisplayProperties) {
    function toToChartData(data: any[]): { x: any, y: any }[] {
        return data.map((value, index) => {
            return {x: index, y: value}
        })
    }

    return (
        <Box id={properties.id} className={properties.className ? `scatter-display ${properties.className}` : "scatter-display"}>
            <Box className={"scatter-overlay"}>
                <Box className={"scatter-overlay-content"}>
                    <h3>{properties.overlayText}</h3>
                </Box>
            </Box>
            <Paper className={"scatter-paper"} elevation={5}>
                <Grid2 className={"scatter-paper-grid"} container columns={1}>
                    {
                        properties.title ?
                            <Grid2 className={"scatter-title"} size={1}>
                                <h4>{properties.title}</h4>
                            </Grid2> : <></>
                    }
                    <Grid2 className={"scatter-graph"} size={1}>
                        <ResponsiveContainer>
                            <ScatterChart>
                                {
                                    Object.entries(properties.data).find(([_, value]) => value.length > 0) ?
                                        <CartesianGrid strokeDasharray="3 3" /> : <></>
                                }
                                <XAxis scale={"linear"} dataKey="x" type="number" hide={true}/>
                                <YAxis dataKey="y" type="number" hide={true}/>
                                {
                                    Object.entries(properties.data).map(([key, value]) =>
                                        <Scatter key={key} name={key} data={toToChartData(value)} fill={`var(--scatter-color-${key})`} fillOpacity={0.4}/>
                                    )
                                }
                            </ScatterChart>
                        </ResponsiveContainer>
                    </Grid2>
                </Grid2>
            </Paper>
        </Box>
    )
}