'use client';

import React from 'react';
import RecentAuditActivity from "@/components/Logs/RecentAuditActivity";

/** Training-domain recent activity for the training overview — thin wrapper over
 *  the shared, server-filtered {@link RecentAuditActivity}. */
export default function RecentTrainingActivity() {
    return <RecentAuditActivity domain="training" title="Recent Training Activity" href="/training/logs"/>;
}
