import React from 'react';
import AuditLogTable from "@/components/Logs/AuditLogTable";

export default function Page() {
    return (
        <AuditLogTable
            domain="events"
            title="Events Logs"
            description="Event management activity, newest first. Click a row for before/after state."
        />
    );
}
