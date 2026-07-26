'use client';
import React from 'react';
import {Box, CircularProgress, Grid, Typography} from "@mui/material";
import ProfileCard, {ProfileCardUser} from "@/components/Profile/ProfileCard";
import CertificationsCard from "@/components/Profile/CertificationsCard";
import FeedbackCard from "@/components/Profile/FeedbackCard";
import TrainingCard from "@/components/Profile/TrainingCard";
import LinksCard from "@/components/Profile/LinksCard";
import EventsCard from "@/components/Profile/EventsCard";
import ActiveLoaCard from "@/components/Profile/ActiveLoaCard";
import AssignedTrainersCard from "@/components/Profile/AssignedTrainersCard";
import ProgressionCard from "@/components/Profile/ProgressionCard";
import UpcomingTrainingAppointmentCard from "@/components/Profile/UpcomingTrainingAppointmentCard";
import {useMe} from "@/lib/osmium/hooks/me";

export default function Page() {

    const {data: me, isLoading} = useMe();

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><CircularProgress/></Box>;
    }

    if (!me) {
        return <Typography variant="h5" textAlign="center">You must be logged in to view this page.</Typography>;
    }

    const profileUser: ProfileCardUser = {
        cid: me.cid,
        fullName: me.display_name,
        operatingInitials: me.profile.operating_initials,
        controllerStatus: me.controller_status,
        email: me.email,
        preferredName: me.profile.preferred_name,
        rating: me.rating ?? '',
        receiveEmail: me.profile.receive_event_notifications,
        timezone: me.profile.timezone,
        bio: me.profile.bio,
        noEditProfile: me.flags.no_edit_profile,
    };

    return (
        <Grid container columns={6} spacing={2}>
            <Grid size={6}>
                <Typography variant="h4">Your Profile</Typography>
            </Grid>
            <Grid size={6}>
                <UpcomingTrainingAppointmentCard timeZone={me.profile.timezone}/>
            </Grid>
            <Grid size={6}>
                <ActiveLoaCard/>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 2
                }}>
                <ProfileCard user={profileUser}/>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 2
                }}>
                <AssignedTrainersCard controllerStatus={me.controller_status ?? ''}
                                     disableRequest={me.flags.no_request_training_assignments}
                                     disableRelease={me.flags.no_request_trainer_release}/>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 2
                }}>
                <CertificationsCard/>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 4
                }}>
                <ProgressionCard/>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 2
                }}>
                <LinksCard/>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 4
                }}>
                <FeedbackCard cid={Number(me.cid)}/>
            </Grid>
            <Grid
                size={{
                    xs: 6,
                    md: 2
                }}>
                <EventsCard cid={Number(me.cid)} timezone={me.profile.timezone}/>
            </Grid>
            <Grid
                size={8}>
                <TrainingCard cid={Number(me.cid)}/>
            </Grid>

        </Grid>
    );
}
