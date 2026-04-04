import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {Card, CardContent, Chip, Grid, Stack, Typography} from "@mui/material";
import VisitorApplicationDecisionForm from "@/components/VisitorApplication/VisitorApplicationDecisionForm";
import {VisitorApplicationStatus} from "@prisma/client";
import {getRating} from "@/lib/vatsim";
import {User} from "next-auth";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const {id} = params;

    const application = await prisma.visitorApplication.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
        },
    });

    if (!application) {
        notFound();
    }

    const getStatusColor = (status: VisitorApplicationStatus) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'APPROVED':
                return 'success';
            case 'DENIED':
                return 'error';
            default:
                return 'default';
        }
    }

    return (
        (<Card>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h5">Visitor Application</Typography>
                    <Chip label={application.status} color={getStatusColor(application.status)}/>
                </Stack>
                <Typography
                    variant="subtitle2">{application.user.fullName} ({application.user.cid})</Typography>
                <Typography variant="subtitle2">{application.submittedAt.toUTCString()}</Typography>
                <Grid container spacing={2} columns={2} sx={{mt: 2, mb: 4,}}>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Email</Typography>
                        <Typography variant="body2">{application.user.email}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">CID</Typography>
                        <Typography variant="body2">{application.user.cid}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Rating</Typography>
                        <Typography variant="body2">{getRating(application.user.rating)}</Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Typography variant="subtitle2">Home Facility</Typography>
                        <Typography variant="body2">{application.homeFacility}</Typography>
                    </Grid>
                    <Grid size={2}>
                        <Typography variant="subtitle2">Reason for Visiting</Typography>
                        <Typography variant="body2">{application.whyVisit}</Typography>
                    </Grid>
                    {application.status === "DENIED" && <Grid size={2}>
                        <Typography variant="subtitle2">Reason for Denial</Typography>
                        <Typography variant="body2">{application.reasonForDenial || 'N/A'}</Typography>
                    </Grid>}
                </Grid>
                {application.status === "PENDING" &&
                    <VisitorApplicationDecisionForm application={application} user={application.user as User}/>}
            </CardContent>
        </Card>)
    );
}