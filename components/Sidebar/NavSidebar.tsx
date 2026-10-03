'use client';
import React, {ReactNode} from 'react';
import {Box, Drawer, IconButton, List, Stack, Tooltip, Typography} from "@mui/material";
import {Close, Menu} from "@mui/icons-material";
import Logo from "@/components/Logo/Logo";

export default function NavSidebar({children, title, open, openButton, onOpen, onClose}: {
    children?: ReactNode,
    title: string,
    open?: boolean,
    openButton?: boolean,
    onOpen?: () => void,
    onClose?: () => void,
}) {

    const closeSidebar = () => {
        onClose && onClose();
    };

    return (
        <>
            {openButton && <Tooltip title="Open Sidebar">
                <IconButton color="inherit" onClick={onOpen} sx={{display: {xs: 'inline-block', xl: 'none',},}}>
                    <Menu/>
                </IconButton>
            </Tooltip>}
            <Drawer open={open} onClose={closeSidebar} hideBackdrop={!openButton}>
                <Stack direction="column" spacing={1} sx={{flex: 1, minHeight: 0,}}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between"
                           sx={{padding: 2,}}>
                        <Box onClick={closeSidebar}>
                            <Logo/>
                        </Box>
                        <Tooltip title="Close Sidebar">
                            <IconButton onClick={closeSidebar}>
                                <Close/>
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    <Typography variant="h6" textAlign="center" sx={{px: 1,}}>{title}</Typography>
                    <List sx={{overflow: 'auto', flex: 1,}}>
                        {children}
                    </List>
                </Stack>

            </Drawer>
        </>
    );
}