import React from 'react';
import {Grid} from "@mui/material";
import SyncStatusChip from "@/components/Admin/SyncStatusChip";
import TrainingOverviewStats from "@/components/Training/TrainingOverviewStats";
import UpcomingAppointmentsCard from "@/components/Training/UpcomingAppointmentsCard";
import EnvironmentStatusCard from "@/components/Training/EnvironmentStatusCard";
import TrainingStaffCounts from "@/components/Training/TrainingStaffCounts";
import RecentTrainingActivity from "@/components/Training/RecentTrainingActivity";

// TRAINING_ENVIRONMENTS is a server-side (non-NEXT_PUBLIC) runtime env var. Read
// it at request time, not module scope — otherwise this static page bakes its
// value (or the ERR-CONFIG fallback) at BUILD time, ignoring the runtime env.
export const dynamic = 'force-dynamic';

export default function Page() {
    const trainingEnvironments = process.env.TRAINING_ENVIRONMENTS?.split(",") || ["ERR-CONFIG"];
    return (
        (<Grid container columns={4} spacing={2}>
            <TrainingStaffCounts/>
            <TrainingOverviewStats/>
            <Grid size={{xs: 4, md: 2,}}>
                <SyncStatusChip jobName="appointments_sync" label="Appointments Sync"/>
            </Grid>
            <Grid size={{xs: 4, md: 2,}}>
                <EnvironmentStatusCard environments={trainingEnvironments}/>
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
