'use client';
import React from 'react';
import {Button, Card, CardActions, CardContent, Chip, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {Edit} from "@mui/icons-material";
import LoaDeleteButton from "@/components/LOA/LoaDeleteButton";
import {useMyLoas} from "@/lib/osmium/hooks/loa";

const getLoaColor = (status: string) => {
    switch (status) {
        case "APPROVED":
            return "success";
        case "DENIED":
            return "error";
        case "PENDING":
            return "warning";
        default:
            return "info";
    }
}

export default function ActiveLoaCard() {
    const {data} = useMyLoas();
    const loa = data?.items.find((l) => l.status !== 'INACTIVE');

    if (!loa) {
        return null;
    }

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1,}}>
                    <Typography variant="h6">Active LOA Request</Typography>
                    <Chip label={loa.status} color={getLoaColor(loa.status)}/>
                </Stack>
                <Typography
                    variant="subtitle2">{new Date(loa.start).toDateString()} - {new Date(loa.end).toDateString()}</Typography>
            </CardContent>
            <CardActions>
                <Link href="/profile/loa/modify">
                    <Button variant="contained" startIcon={<Edit/>}>
                        Modify
                    </Button>
                </Link>
                <LoaDeleteButton loa={loa}/>
            </CardActions>
        </Card>
    );
}
