import {createRoot} from 'react-dom/client'
import "./main.scss"
import {CssBaseline} from "@mui/material";
import Header from "./components/page/header.tsx";
import Content from "./components/page/content.tsx";

createRoot(document.getElementById('root')!).render(
    <>
        <CssBaseline/>
        <Header/>
        {/*<Content/>*/}
    </>
)
