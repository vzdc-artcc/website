'use client';
import React from 'react';
import {Alert} from "@mui/material";
import {useFeedbackList} from "@/lib/osmium/hooks/feedback";
import {useAdminLoas} from "@/lib/osmium/hooks/loa";
import {useAdminIncidentList} from "@/lib/osmium/hooks/incidents";
import {useAdminVisitorApplications} from "@/lib/osmium/hooks/visitor";
import {useOtsRecommendations, useTrainerReleaseRequests} from "@/lib/osmium/hooks/training";

export default function StaffTasksAlertClient() {
    const {data: visitorData} = useAdminVisitorApplications({status: 'PENDING', pageSize: 1});
    const {data: feedbackData} = useFeedbackList({status: 'PENDING', pageSize: 1});
    const {data: incidentData} = useAdminIncidentList({closed: false, pageSize: 1});
    const {data: loaData} = useAdminLoas({status: 'PENDING', pageSize: 1});
    const {data: otsData} = useOtsRecommendations();
    const {data: releasesData} = useTrainerReleaseRequests();

    const pendingAdminTasks = (visitorData?.total ?? 0) + (feedbackData?.total ?? 0)
        + (incidentData?.total ?? 0) + (loaData?.total ?? 0);

    const pendingOtsRecs = (otsData?.items ?? []).filter((o) => !o.assigned_instructor_id).length;
    const pendingReleaseRequests = (releasesData?.items ?? []).filter((r) => r.status === 'PENDING').length;
    const pendingTrainingTasks = pendingOtsRecs + pendingReleaseRequests;

    return (
        <>
            {pendingAdminTasks > 0 &&
                <Alert severity="warning" sx={{my: 1,}}>
                    There {pendingAdminTasks == 1 ? 'is' : 'are'} currently <b>{pendingAdminTasks} pending senior staff
                    task{pendingAdminTasks == 1 ? '' : 's'}</b> under Facility Administration.
                </Alert>}
            {pendingTrainingTasks > 0 &&
                <Alert severity="warning" sx={{my: 1,}}>
                    There {pendingTrainingTasks == 1 ? 'is' : 'are'} currently <b>{pendingTrainingTasks} pending TA
                    task{pendingTrainingTasks == 1 ? '' : 's'}</b> under Training Administration.
                </Alert>}
        </>
    );
}
