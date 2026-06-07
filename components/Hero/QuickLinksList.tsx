import React from 'react';
import Link from "next/link";
import {List, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import {
    AddComment,
    AirplanemodeActive,
    BarChart,
    CalendarMonth,
    ListAlt,
    OpenInNew,
    PersonAdd
} from "@mui/icons-material";

export default function QuickLinksList() {
    return (
        <List>

            <Link href="/controllers/roster/home" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <ListAlt/>
                    </ListItemIcon>
                    <ListItemText primary="Roster"/>
                </ListItemButton>
            </Link>
            <Link href="/visitor/new" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <PersonAdd/>
                    </ListItemIcon>
                    <ListItemText primary="Visitor Application"/>
                </ListItemButton>
            </Link>
            <Link href="/controllers/statistics" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <BarChart/>
                    </ListItemIcon>
                    <ListItemText primary="Statistics"/>
                </ListItemButton>
            </Link>
            <Link href="/airports" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <AirplanemodeActive/>
                    </ListItemIcon>
                    <ListItemText primary="Airport Database"/>
                </ListItemButton>
            </Link>
            <Link href="/sua/new" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <CalendarMonth/>
                    </ListItemIcon>
                    <ListItemText primary="vSOA Request"/>
                </ListItemButton>
            </Link>
            <Link href="/feedback/new" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <AddComment/>
                    </ListItemIcon>
                    <ListItemText primary="Give Feedback"/>
                </ListItemButton>
            </Link>
            <Link href="https://www.vatusa.net" target="_blank"
                  style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <OpenInNew/>
                    </ListItemIcon>
                    <ListItemText primary="VATUSA"/>
                </ListItemButton>
            </Link>
            <Link href="https://www.vatsim.net" target="_blank"
                  style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <OpenInNew/>
                    </ListItemIcon>
                    <ListItemText primary="VATSIM"/>
                </ListItemButton>
            </Link>
        </List>
    );
}