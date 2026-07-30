'use client';
import React from 'react';
import {useParams} from "next/navigation";
import {Alert, Card, CardContent, CircularProgress, Stack, Typography} from "@mui/material";
import {useUserByCid} from "@/lib/osmium/hooks/users";
import UserPermissionsCard from "@/components/Access/UserPermissionsCard";
import ImpersonateUserCard from "@/components/Impersonation/ImpersonateUserCard";
import UserIpHistoryCard from "@/components/Access/UserIpHistoryCard";
import UserSessionsCard from "@/components/Access/UserSessionsCard";

export default function Page() {
    const params = useParams<{ cid: string }>();
    const cid = Number(params.cid);
    const {data: user, isLoading, isError} = useUserByCid(cid);

    if (isLoading) {
        return <CircularProgress/>;
    }

    if (isError || !user) {
        return <Alert severity="error">No controller found with CID {params.cid}.</Alert>;
    }

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5">{user.basic.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        CID {user.basic.cid}{user.basic.rating ? ` — ${user.basic.rating}` : ''}
                    </Typography>
                </CardContent>
            </Card>
            <UserPermissionsCard cid={cid}/>
            <ImpersonateUserCard cid={cid} name={user.basic.name}/>
            <UserSessionsCard cid={cid}/>
            <UserIpHistoryCard cid={cid}/>
        </Stack>
    );
}
