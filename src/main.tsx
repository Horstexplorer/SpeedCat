import {createRoot} from 'react-dom/client'
import "./main.scss"
import {CssBaseline} from "@mui/material"
import PageGlobalHeader from "./components/header/global-header.tsx";
import GlobalContentRouter from "./components/router/global-content-router.tsx";

createRoot(document.getElementById('root')!).render(
    <>
        <CssBaseline/>
        <PageGlobalHeader/>
        <GlobalContentRouter/>
    </>
)
