'use client';
import React, {ReactNode} from 'react';
import {
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import MatrixName from "@/components/Misc/MatrixName";
import UserStaffPositionChips from "@/components/StaffPositions/UserStaffPositionChips";
import {useStaffPositionHolders} from "@/lib/osmium/hooks/staff-positions";
import {useUsersByRole} from "@/lib/osmium/hooks/users";

const VATUSA_FACILITY = process.env.NEXT_PUBLIC_VATUSA_FACILITY ?? 'vZDC';

type StaffMember = { cid: number; name: string; rating?: string | null };

export default function Page() {

    const useHolders = (position: string): StaffMember[] =>
        (useStaffPositionHolders(position).data?.holders ?? [])
            .map((h) => ({cid: h.cid, name: h.display_name, rating: h.rating}));
    const useRoleUsers = (role: string): StaffMember[] =>
        (useUsersByRole(role).data?.items ?? [])
            .map((u) => ({cid: u.basic.cid, name: u.basic.name, rating: u.basic.rating}));

    const atm = useHolders('ATM')[0];
    const datm = useHolders('DATM')[0];
    const ta = useHolders('TA')[0];
    const fe = useHolders('FE')[0];
    const wm = useHolders('WM')[0];
    const ec = useHolders('EC')[0];
    const atas = useHolders('ATA');
    const awms = useHolders('AWM');
    const afes = useHolders('AFE');
    const aecs = useHolders('AEC');
    const fcs = useHolders('FC');
    const instructors = useRoleUsers('INS');
    const mentors = useRoleUsers('MTR');

    return (
        (<Grid container columns={12} spacing={2}>
            <Grid size={12}>
                <Card><CardContent><Typography variant="h6">{VATUSA_FACILITY} Staff</Typography></CardContent></Card>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="subtitle2">Air Traffic Manager (ATM)</Typography>
                        <Typography variant="h3">{atm?.name}</Typography>
                        <Typography>atm@vzdc.org</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="subtitle2">Deputy Air Traffic Manager (DATM)</Typography>
                        <Typography variant="h3">{datm?.name}</Typography>
                        <Typography>datm@vzdc.org</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 12, md: 6, lg: 3}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="subtitle2">Training Administrator (TA)</Typography>
                        <Typography variant="h4">{ta?.name}</Typography>
                        <Typography>ta@vzdc.org</Typography>
                        <Typography variant="subtitle2" sx={{mt: 4,}}>Assistant Training Administrators (ATAs)</Typography>
                        {getAssistantTable(atas)}
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 12, md: 6, lg: 3}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="subtitle2">Event Coordinator (EC)</Typography>
                        <Typography variant="h4">{ec?.name}</Typography>
                        <Typography>ec@vzdc.org</Typography>
                        <Typography variant="subtitle2" sx={{mt: 4,}}>Assistant Event Coordinators (AECs)</Typography>
                        {getAssistantTable(aecs)}
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 12, md: 6, lg: 3}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="subtitle2">Facility Engineer (FE)</Typography>
                        <Typography variant="h4">{fe?.name}</Typography>
                        <Typography>fe@vzdc.org</Typography>
                        <Typography variant="subtitle2" sx={{mt: 4,}}>Assistant Facility Engineers (AFEs)</Typography>
                        {getAssistantTable(afes)}
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 12, md: 6, lg: 3}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="subtitle2">Webmaster (WM)</Typography>
                        <MatrixName firstName={wm?.name ?? ''} lastName={''}/>
                        <Typography>wm@vzdc.org</Typography>
                        <Typography variant="subtitle2" sx={{mt: 4,}}>Assistant Webmasters (AWMs)</Typography>
                        {getAssistantTable(awms)}
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6">Instructors</Typography>
                        {getAssistantTable(instructors)}
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6">Mentors</Typography>
                        {getAssistantTable(mentors)}
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 12,}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6">Financial Committee</Typography>
                        {getAssistantTable(fcs, "Staff Position(s)", (u) => <UserStaffPositionChips cid={u.cid}/>)}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>)
    );
}

const getAssistantTable = (users: StaffMember[], extraColumnName?: string, extraColumn?: (user: StaffMember) => ReactNode) => {
    return users.length > 0 ? (
        <TableContainer sx={{maxHeight: 600}}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Rating</TableCell>
                        {extraColumnName && <TableCell>{extraColumnName}</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map(user => (
                        <TableRow key={user.cid}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.rating ?? ''}</TableCell>
                            {extraColumn && <TableCell>{extraColumn(user)}</TableCell>}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    ) : (<Typography variant="caption">N/A</Typography>);
}
