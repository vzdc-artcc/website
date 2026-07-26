'use client';
import React from 'react';
import {Alert, Card, CardContent, Checkbox, CircularProgress, FormControlLabel, Stack, Tooltip, Typography} from "@mui/material";
import {toast} from "react-toastify";
import {
    STAFF_POSITIONS,
    type StaffPosition,
    useAssignStaffPosition,
    useRevokeStaffPosition,
    useStaffPositions,
} from "@/lib/osmium/hooks/staff-positions";
import StaffPositionChips from "@/components/StaffPositions/StaffPositionChips";

export default function StaffPositionsCard({cid}: { cid: number }) {
    const {data, isLoading, isError} = useStaffPositions(cid);
    const assign = useAssignStaffPosition();
    const revoke = useRevokeStaffPosition();

    const held = new Set(data?.positions.map((p) => p.position) ?? []);
    const sourceByPosition = new Map(data?.positions.map((p) => [p.position, p.source]) ?? []);
    const pending = assign.isPending || revoke.isPending;

    const toggle = async (position: StaffPosition, checked: boolean) => {
        try {
            if (checked) {
                await assign.mutateAsync({cid, position});
            } else {
                await revoke.mutateAsync({cid, position});
            }
        } catch {
            toast(`Failed to ${checked ? 'assign' : 'revoke'} ${position}.`, {type: 'error'});
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 1,}}>Staff Positions</Typography>
                    <CircularProgress size={24}/>
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 1,}}>Staff Positions</Typography>
                    <Alert severity="error">Failed to load staff positions.</Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{mb: 1,}}>Staff Positions</Typography>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2,}}>
                    Display-only roster tags — these never grant permissions. ATM, DATM, TA, EC, WM, FE, INS,
                    and MTR sync automatically from the VATUSA roster unless manually overridden here.
                </Typography>
                {held.size > 0 && (
                    <Stack direction="row" flexWrap="wrap" sx={{mb: 2,}}>
                        <StaffPositionChips positions={Array.from(held)}/>
                    </Stack>
                )}
                <Stack direction="row" flexWrap="wrap">
                    {STAFF_POSITIONS.map((position) => (
                        <Tooltip key={position}
                                 title={sourceByPosition.has(position) ? `Source: ${sourceByPosition.get(position)}` : ''}>
                            <FormControlLabel
                                sx={{width: {xs: '50%', sm: '25%'}, mr: 0,}}
                                control={
                                    <Checkbox
                                        checked={held.has(position)}
                                        disabled={pending}
                                        onChange={(e) => toggle(position, e.target.checked)}
                                    />
                                }
                                label={position}
                            />
                        </Tooltip>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}
