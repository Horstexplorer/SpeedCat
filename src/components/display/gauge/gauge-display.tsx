import "./gauge-display.scss"
import {Box, Paper} from "@mui/material"
import {Cell, Pie, PieChart, ResponsiveContainer} from "recharts"

export interface IDisplayGaugeProperties {
    id?: string
    className?: string
    currentValue?: number
    maxValue?: number
    overlayText?: string
}

export default function GaugeDisplay(properties: IDisplayGaugeProperties) {

    return (
        <Box id={properties.id} className={properties.className ? `gauge-display ${properties.className}` : "gauge-display"}>
            <Box className={"gauge-overlay"}>
                <Box className={"gauge-overlay-content"}>
                    <h3>{properties.overlayText}</h3>
                </Box>
            </Box>
            <Paper className={"gauge-paper"} elevation={5}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            animationDuration={1}
                            startAngle={245}
                            endAngle={-65}
                            innerRadius="70%"
                            data={[{value: properties.currentValue}, {value: Math.max(0, (properties.maxValue || 100) - (properties.currentValue || 0))}]}
                            dataKey="value"
                            labelLine={false}
                            blendStroke
                            isAnimationActive={false}
                        >
                            <Cell key={"fill"} fill="var(--gauge-color)"/>
                            <Cell key={"empty"} fill="#eaeaea"/>
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </Paper>
        </Box>
    )

}