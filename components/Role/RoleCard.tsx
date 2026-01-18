import React from 'react';
import {User} from "next-auth";
import {Card, CardContent, Typography} from "@mui/material";
import RoleForm from "@/components/Role/RoleForm";

export default async function RoleCard({user}: { user: User, }) {

    const webSystemMembers = process.env.WEB_TEAM_MEMBERS?.split(',').map(s => s.trim()).filter(Boolean) || [];
    const isWebSystemMember = Boolean(user?.cid && webSystemMembers.includes(user.cid));

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{mb: 2,}}>Roles</Typography>
                <RoleForm user={user} isWebSystemMember={isWebSystemMember}/>
            </CardContent>
        </Card>
    );
}