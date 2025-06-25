'use client';
import React, {useState} from 'react';
import {IconButton, Menu, MenuItem, Tooltip} from "@mui/material";
import {Apps, DeveloperBoard, Public, Radar, Map} from "@mui/icons-material";
import Link from "next/link";

export default function AppPickerMenu() {

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const open = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }

    const close = () => {
        setAnchorEl(null);
    }

    return (
        <>
            <Tooltip title="VZDC Apps">
                <IconButton color="inherit" onClick={(e) => open(e)}>
                    <Apps/>
                </IconButton>
            </Tooltip>
            <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={close}>
                <Link href="https://www.vzdc.org" passHref style={{color: 'inherit', textDecoration: 'none',}}>
                    <MenuItem onClick={close}>
                        <Public sx={{mr: 1,}}/>Website
                    </MenuItem>
                </Link>
                {/*<Link href="https://training.vzdc.org" passHref style={{color: 'inherit', textDecoration: 'none',}}>*/}
                {/*    <MenuItem onClick={close}><CalendarMonth sx={{mr: 1,}}/>Training Scheduler</MenuItem>*/}
                {/*</Link>*/}
                <Link href="https://ids.vzdc.org" passHref style={{color: 'inherit', textDecoration: 'none',}}>
                    <MenuItem onClick={close}><DeveloperBoard sx={{mr: 1,}}/>I.D.S</MenuItem>
                </Link>
                <Link href="https://asx.vzdc.org" passHref style={{color: 'inherit', textDecoration: 'none',}}>
                    <MenuItem onClick={close}><Radar sx={{mr: 1,}}/>A.S.X</MenuItem>
                </Link>
                <Link href="https://rvm.vzdc.org" passHref style={{color: 'inherit', textDecoration: 'none',}}>
                    <MenuItem onClick={close}><Map sx={{mr: 1,}}/>R.V.M</MenuItem>
                </Link>
            </Menu>
        </>
    );
}