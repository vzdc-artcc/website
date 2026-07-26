'use client';
import {CalendarMonth, Home, Insights, ListAlt, RecentActors} from "@mui/icons-material";
import {Link, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import MenuWrapper from "./MenuWrapper";
import EventsMenuStaffingBadge from "./EventsMenuStaffingBadge";
import {useStaffPositionHolderName} from "@/lib/osmium/hooks/staff-positions";

export default function EventMenu() {

    const ecName = useStaffPositionHolderName("EC");

    return (
        <MenuWrapper title="Events Administration" subheadings={[`EC: ${ecName}`]}>
            <Link href="/events/admin/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Home/>
                    </ListItemIcon>
                    <ListItemText primary="Overview"/>
                </ListItemButton>
            </Link>
            <Link href="/events/admin/events" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <CalendarMonth/>
                    </ListItemIcon>
                    <ListItemText primary="Events"/>
                </ListItemButton>
            </Link>
            <Link href="/events/admin/event-presets" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <RecentActors/>
                    </ListItemIcon>
                    <ListItemText primary="Event Position Presets"/>
                </ListItemButton>
            </Link>
            <Link href="/events/admin/controller" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Insights/>
                    </ListItemIcon>
                    <ListItemText primary="Controller Statistics"/>
                </ListItemButton>
            </Link>
            <EventsMenuStaffingBadge/>
            <Link href="/events/admin/logs" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <ListAlt/>
                    </ListItemIcon>
                    <ListItemText primary="Logs"/>
                </ListItemButton>
            </Link>
        </MenuWrapper>     
    )
}