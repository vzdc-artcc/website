import {CalendarMonth, Home, Insights, ListAlt, QuestionAnswer, RecentActors} from "@mui/icons-material";
import {Badge, Link, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import prisma from "@/lib/db";
import MenuWrapper from "./MenuWrapper";

export default async function EventMenu() {

    const staffingRequests = await prisma.staffingRequest.count();

    const ec = await prisma.user.findFirst({
        where: {
            staffPositions: {
                has: "EC"
            },
        },
        select: {
            firstName: true,
            lastName: true
        }
    });

    const ecName = ec ? `${ec.firstName} ${ec.lastName || 'N/A'}` : 'N/A';

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
            <Link href="/events/admin/staffing-requests" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Badge color="primary" badgeContent={staffingRequests}>
                            <QuestionAnswer/>
                        </Badge>
                    </ListItemIcon>
                    <ListItemText primary="Staffing Requests"/>
                </ListItemButton>
            </Link>
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