import React from 'react';
import {Grid} from "@mui/material";
import SyncStatusChip from "@/components/Admin/SyncStatusChip";
import TrainingOverviewStats from "@/components/Training/TrainingOverviewStats";
import UpcomingAppointmentsCard from "@/components/Training/UpcomingAppointmentsCard";
import EnvironmentStatusCard from "@/components/Training/EnvironmentStatusCard";
import TrainingStaffCounts from "@/components/Training/TrainingStaffCounts";
import RecentTrainingActivity from "@/components/Training/RecentTrainingActivity";

const TRAINING_ENVIRONMENTS = process.env.TRAINING_ENVIRONMENTS?.split(",") || ["ERR-CONFIG"];

export default function Page() {
    return (
        (<Grid container columns={4} spacing={2}>
            <TrainingStaffCounts/>
            <TrainingOverviewStats/>
            <Grid size={{xs: 4, md: 2,}}>
                <SyncStatusChip jobName="appointments_sync" label="Appointments Sync"/>
            </Grid>
            <Grid size={{xs: 4, md: 2,}}>
                <EnvironmentStatusCard environments={TRAINING_ENVIRONMENTS}/>
            </Grid>
            <Grid
                size={{
                    xs: 4,
                }}>
                <UpcomingAppointmentsCard/>
            </Grid>
            <Grid size={4}>
                <RecentTrainingActivity/>
            </Grid>
        </Grid>)
    );
}
