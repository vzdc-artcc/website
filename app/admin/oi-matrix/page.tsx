'use client';
import React from 'react';
import {Box, Card, CardContent, Grid, Skeleton, Stack, Tooltip, Typography} from "@mui/material";
import Link from "next/link";
import OperatingInitialAssignmentItem, {OiController} from '@/components/OperatingInitials/OperatingInitialAssignmentItem';
import {useRosterControllers} from "@/lib/osmium/hooks/users";

export default function Page() {

    const {data, isLoading} = useRosterControllers();

    const allControllers: OiController[] = (data?.items ?? []).map((u) => ({
        id: u.full?.id ?? String(u.basic.cid),
        cid: u.basic.cid,
        firstName: u.full?.first_name,
        lastName: u.full?.last_name,
        rating: u.basic.rating,
        operatingInitials: u.full?.operating_initials,
        controllerStatus: u.full?.controller_status,
    }));

    const inUseOperatingInitials = allControllers.filter((c) => c.operatingInitials);

    const allPossibleOperatingInitials = Array.from({length: 26 * 26}, (_, i) => {
        const first = String.fromCharCode(65 + Math.floor(i / 26));
        const second = String.fromCharCode(65 + i % 26);
        return first + second;
    });

    return (
        (<Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5">Operating Initials Matrix</Typography>
                    <Box sx={{mt: 1, border: 2, borderRadius: 2, color: 'cyan',}}>
                        <Typography textAlign="center" variant="body2">In Use - HOME (hover/click to inspect
                            controller)</Typography>
                    </Box>
                    <Box sx={{mt: 1, border: 2, borderRadius: 2, color: 'purple',}}>
                        <Typography textAlign="center" variant="body2">In Use - VISITOR (hover/click to inspect
                            controller)</Typography>
                    </Box>
                    <Box sx={{mt: 1, border: 2, borderRadius: 2,}}>
                        <Typography textAlign="center" variant="body2">Vacant</Typography>
                    </Box>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    {isLoading ? <Skeleton height={300}/> : (
                        <Grid container columns={26} spacing={1}>
                            {allPossibleOperatingInitials.map((initials) => {
                                const inUse = inUseOperatingInitials.find((oi) => oi.operatingInitials === initials);
                                return inUse ? (
                                    <Grid key={initials} size={{xs: 4, sm: 3, md: 2, lg: 1}}>
                                        <Tooltip title={`${inUse.firstName} ${inUse.lastName} - ${inUse.cid}`}>
                                            <Link href={`/admin/controller/${inUse.cid}`} target="_blank"
                                                  style={{textDecoration: 'none',}}>
                                                <Box sx={{
                                                    border: 2,
                                                    borderRadius: 2,
                                                    color: inUse.controllerStatus === "HOME" ? 'cyan' : 'purple',
                                                }}>
                                                    <Typography textAlign="center" variant="body2">{initials}</Typography>
                                                </Box>
                                            </Link>
                                        </Tooltip>
                                    </Grid>
                                ) : (
                                    <OperatingInitialAssignmentItem allControllers={allControllers} initials={initials} key={initials}/>
                                );
                            })}
                        </Grid>
                    )}
                </CardContent>
            </Card>
        </Stack>)
    );
}
