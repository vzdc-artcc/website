export const JOB_LABELS: Record<string, string> = {
    stats_sync: "Statistics Sync",
    roster_sync: "Roster Sync",
    loa_expiration: "LOA Expiration",
    solo_expiration: "Solo Endorsement Expiration",
    event_automation: "Event Automation",
    appointments_sync: "Training Appointments Sync",
    faa_preferred_routes: "FAA Preferred Routes",
};

// stats_sync and roster_sync run continuously in the background and reject
// manual triggering server-side (osmium returns 400 BadRequest for them).
export const RUNNABLE_JOBS = new Set([
    "loa_expiration",
    "solo_expiration",
    "event_automation",
    "appointments_sync",
]);

export function jobLabel(jobName: string): string {
    return JOB_LABELS[jobName] ?? jobName;
}
