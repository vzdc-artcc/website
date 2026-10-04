import {CalendarMonth, Home, Insights, ListAlt, QuestionAnswer, RecentActors} from "@mui/icons-material";
import {Badge, ListItemIcon, ListItemText} from "@mui/material";
import prisma from "@/lib/db";
import MenuWrapper from "./MenuWrapper";
import AdminListItemButton from "@/components/Admin/AdminListItemButton";

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
            <AdminListItemButton href="/events/admin/overview">
                <ListItemIcon>
                    <Home/>
                </ListItemIcon>
                <ListItemText primary="Overview"/>
            </AdminListItemButton>
            <AdminListItemButton href="/events/admin/events">
                <ListItemIcon>
                    <CalendarMonth/>
                </ListItemIcon>
                <ListItemText primary="Events"/>
            </AdminListItemButton>
            <AdminListItemButton href="/events/admin/event-presets">
                <ListItemIcon>
                    <RecentActors/>
                </ListItemIcon>
                <ListItemText primary="Event Position Presets"/>
            </AdminListItemButton>
            <AdminListItemButton href="/events/admin/controller">
                <ListItemIcon>
                    <Insights/>
                </ListItemIcon>
                <ListItemText primary="Controller Statistics"/>
            </AdminListItemButton>
            <AdminListItemButton href="/events/admin/staffing-requests">
                <ListItemIcon>
                    <Badge color="primary" badgeContent={staffingRequests}>
                        <QuestionAnswer/>
                    </Badge>
                </ListItemIcon>
                <ListItemText primary="Staffing Requests"/>
            </AdminListItemButton>
            <AdminListItemButton href="/events/admin/logs">
                <ListItemIcon>
                    <ListAlt/>
                </ListItemIcon>
                <ListItemText primary="Logs"/>
            </AdminListItemButton>
        </MenuWrapper>
    )
}