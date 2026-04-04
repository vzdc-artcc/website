import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {Grid} from "@mui/material";
import ProfileCard from "@/components/Profile/ProfileCard";
import {User} from "next-auth";
import StaffPositionCard from "@/components/Role/StaffPositionCard";
import RoleCard from "@/components/Role/RoleCard";

export default async function Page(props: { params: Promise<{ cid: string }> }) {
    const params = await props.params;

    const {cid} = params;

    const user = await prisma.user.findUnique({
        where: {
            cid,
        },
    });

    if (!user) {
        notFound();
    }

    return (
        (<Grid container columns={2} spacing={2}>
            <Grid size={2}>
                <ProfileCard user={user as User} admin/>
            </Grid>
            <Grid
                size={{
                    xs: 2,
                    md: 1
                }}>
                <RoleCard user={user as User}/>
            </Grid>
            <Grid
                size={{
                    xs: 2,
                    md: 1
                }}>
                <StaffPositionCard user={user as User}/>
            </Grid>
        </Grid>)
    );
}