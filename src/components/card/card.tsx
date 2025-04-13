import "./card.scss"
import {Paper, Stack} from "@mui/material";
import {ReactNode} from "react";

export interface ICardProperties {
    elevation?: number
    children?: ReactNode
}

export default function Card(properties: ICardProperties) {

    return (
        <Paper elevation={properties.elevation} className={"card"}>
            <Stack direction={"column"} spacing={1}>
                {
                    properties.children
                }
            </Stack>
        </Paper>
    )

}