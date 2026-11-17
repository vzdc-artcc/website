'use client';
import React, {ReactNode} from 'react';
import {
    Card,
    CardContent,
    Grid,
    Skeleton,
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

/**
 * A staff list plus its query status, so a vacancy is told apart from loading or a failed request.
 * Cached data wins over the query status: TanStack sets status 'error' when a background refetch
 * fails while the last good data is still cached, and that data is still right to show.
 */
type StaffList = { status: 'pending' | 'error' | 'success'; members: StaffMember[] };

export default function Page() {

    const useHolders = (position: string): StaffList => {
        const {status, data} = useStaffPositionHolders(position);
        return {
            status: data ? 'success' : status,
            members: (data?.holders ?? []).map((h) => ({cid: h.cid, name: h.display_name, rating: h.rating})),
        };
    };
    const useRoleUsers = (role: string): StaffList => {
        const {status, data} = useUsersByRole(role);
        return {
            status: data ? 'success' : status,
            members: (data?.items ?? []).map((u) => ({cid: u.basic.cid, name: u.basic.name, rating: u.basic.rating})),
        };
    };

    const atm = useHolders('ATM');
    const datm = useHolders('DATM');
    const ta = useHolders('TA');
    const fe = useHolders('FE');
    const wm = useHolders('WM');
    const ec = useHolders('EC');
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
                        <HolderName holders={atm} variant="h3"/>
                        <Typography>atm@vzdc.org</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="subtitle2">Deputy Air Traffic Manager (DATM)</Typography>
                        <HolderName holders={datm} variant="h3"/>
                        <Typography>datm@vzdc.org</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 12, md: 6, lg: 3}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="subtitle2">Training Administrator (TA)</Typography>
                        <HolderName holders={ta} variant="h4"/>
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
                        <HolderName holders={ec} variant="h4"/>
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
                        <HolderName holders={fe} variant="h4"/>
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
                        <HolderName holders={wm} variant="h4" matrix/>
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

const HolderName = ({holders, variant, matrix}: { holders: StaffList; variant: 'h3' | 'h4'; matrix?: boolean }) => {
    if (holders.status === 'pending') {
        return <Typography variant={variant}><Skeleton width="60%"/></Typography>;
    }
    if (holders.status === 'error') {
        return <Typography variant={variant} color="text.secondary">Unavailable</Typography>;
    }
    const name = holders.members[0]?.name ?? 'N/A';
    return matrix ? <MatrixName firstName={name} lastName={''}/> : <Typography variant={variant}>{name}</Typography>;
}

const getAssistantTable = ({status, members: users}: StaffList, extraColumnName?: string, extraColumn?: (user: StaffMember) => ReactNode) => {
    if (status === 'pending') {
        return <Skeleton width="60%"/>;
    }
    if (status === 'error') {
        return <Typography variant="caption" color="text.secondary">Unavailable</Typography>;
    }
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
