import React from 'react';
import {AppBar, Box, Stack, Toolbar} from "@mui/material";
import ColorModeSwitcher from "@/components/Navbar/ColorModeSwitcher";
import NavButtons from "@/components/Navbar/NavButtons";
import LoginButton from "@/components/Navbar/LoginButton";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import RootSidebar from "@/components/Sidebar/RootSidebar";
import AppPickerMenu from "@/components/AppPicker/AppPickerMenu";
import NavbarLogo from "@/components/Navbar/NavbarLogo";

export default async function Navbar() {

    const session = await getServerSession(authOptions);

    return (
        <AppBar position="sticky" color="inherit" variant="outlined">
            <Toolbar disableGutters>
                <Stack direction="row" alignItems="center">
                    <RootSidebar session={session}/>
                    <NavbarLogo/>
                    <Box sx={{display: {xs: 'none', xl: 'flex',},}}>
                        <NavButtons/>
                    </Box>
                </Stack>
                <span style={{flexGrow: 1,}}></span>
                <Box sx={{mr: 2,}}>
                    <ColorModeSwitcher/>
                    <AppPickerMenu/>
                    <Box sx={{display: {xs: 'none', sm: 'inline-block',},}}>
                        <LoginButton session={session}/>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
}