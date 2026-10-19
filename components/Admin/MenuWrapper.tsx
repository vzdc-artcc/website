import {Box, Divider, List, Stack, Typography} from "@mui/material";
import React from "react";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {getChips} from "@/lib/staffPositions";
import {getRating} from "@/lib/vatsim";
import {permanentSidebarResponsive} from "@/lib/adminSidebar";

export default async function MenuWrapper({title, subheadings, children,}: {
    title: string,
    subheadings: string[],
    children: React.ReactNode
}) {

    const session = await getServerSession(authOptions);

    return (
        <Stack sx={{flex: 1, minHeight: 0,}}>
            <Box sx={{p: 1,}}>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: "bold",
                        display: permanentSidebarResponsive('none', 'block')
                    }}>{title}</Typography>
                {subheadings.map((subheading, idx) => (
                    <Typography key={idx} variant="caption" sx={{display: 'block',}}>{subheading}</Typography>
                ))}
            </Box>
            <Divider/>
            <List sx={{overflow: 'auto', flex: 1,}}>
                {children}
            </List>
            <Divider/>
            <Box sx={{p: 1,}}>
                <Typography variant="subtitle2"
                            gutterBottom>{`${session?.user.fullName || ''} - ${getRating(session?.user.rating || 0)}`}</Typography>
                <Typography component="div">{session ? getChips(session?.user) : <></>}</Typography>
            </Box>
        </Stack>
    );
}