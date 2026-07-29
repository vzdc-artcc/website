import React from 'react';
import {AppBar, Box, Stack, Toolbar} from "@mui/material";
import ColorModeSwitcher from "@/components/Navbar/ColorModeSwitcher";
import Logo from "@/components/Logo/Logo";
import NavButtons from "@/components/Navbar/NavButtons";
import LoginButton from "@/components/Navbar/LoginButton";
import RootSidebar from "@/components/Sidebar/RootSidebar";
import AppPickerMenu from "@/components/AppPicker/AppPickerMenu";

export default function Navbar() {

    return (
        <AppBar position="sticky" sx={{backgroundColor: '#f5f5f5', color: 'black',}}>
            <Toolbar>
                <Stack direction="row" spacing={3} alignItems="center">
                    <RootSidebar/>
                    <Logo priority/>
                    <Box sx={{display: {xs: 'none', xl: 'flex',},}}>
                        <NavButtons/>
                    </Box>
                </Stack>
                <span style={{flexGrow: 1,}}></span>
                <Box>
                    <ColorModeSwitcher/>
                    <AppPickerMenu/>
                    <Box sx={{display: {xs: 'none', sm: 'inline-block',},}}>
                        <LoginButton/>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
}