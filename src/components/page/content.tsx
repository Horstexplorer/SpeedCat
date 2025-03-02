import "./content.scss"
import {Box} from "@mui/material"
import {BrowserRouter, Route, Routes} from "react-router-dom"
import SpeedtestPage from "./speedtest/page/speedtest-page.tsx"

export default function Content() {

    return (
        <Box className="content">
            <BrowserRouter>
                <Routes>
                    <Route path={"/"}>
                        <Route index element={<SpeedtestPage/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </Box>
    )
}