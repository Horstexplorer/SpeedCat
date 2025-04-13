import "./card-header.scss"
import {Box, Stack, Typography} from "@mui/material";
import {ReactNode} from "react";

export interface ICardHeader {
    title?: string
    withSpacer?: boolean
    children?: ReactNode
}

export default function CardHeader(properties: ICardHeader) {
    return (
        <Stack direction={"row"} spacing={0} className={"card-header"}>
            {
                properties.title ?
                    <Typography className={"card-title"}>
                        {properties.title}
                    </Typography> :
                    <></>
            }
            {
                properties.title && properties.withSpacer ?
                    <Box className={"full-width-spacer"} /> :
                    <></>
            }
            {
                properties.children
            }
        </Stack>
    )
}