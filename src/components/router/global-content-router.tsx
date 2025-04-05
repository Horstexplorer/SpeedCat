import "./global-content-router.scss"
import {Box} from "@mui/material"
import {BrowserRouter, Route, Routes} from "react-router-dom"
import SpeedtestPage from "../../page/speedtest/speedtest-page.tsx";

export default function GlobalContentRouter() {

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