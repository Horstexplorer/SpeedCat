import "./global-header.scss"
import {AppBar, Box, Drawer, IconButton, Toolbar, Typography} from "@mui/material"
import {useState} from "react"
import SettingsIcon from "@mui/icons-material/Settings"
import CloseIcon from "@mui/icons-material/Close"
import GitHubIcon from "@mui/icons-material/GitHub"
import SpeedtestConfigurator from "../speedtest-configurator/speedtest-configurator.tsx";

export default function PageGlobalHeader() {

    const [openDrawer, setDrawerOpen] = useState<boolean>(false)

    return (
        <Box className="header">
            <AppBar className="header-app-bar">
                <Toolbar>
                    <Typography variant="h6" component="div">
                        SpeedCat
                    </Typography>
                    <Box className={"full-width-spacer"} />
                    <IconButton className={"header-icon-button"} onClick={() => window.location.href = "https://github.com/Horstexplorer/SpeedCat"}>
                        <GitHubIcon />
                    </IconButton>
                    <IconButton className={"header-icon-button"} onClick={() => {
                        setDrawerOpen(!openDrawer)
                    }}>
                        { !openDrawer ? <SettingsIcon /> : <CloseIcon />}
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer className="header-drawer" open={openDrawer} PaperProps={{
                sx: { width: "100%" }
            }}>
                <Toolbar />
                <SpeedtestConfigurator/>
            </Drawer>
        </Box>
    )

}