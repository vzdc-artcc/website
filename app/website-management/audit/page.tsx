import React from 'react';
import AuditLogTable from "@/components/Logs/AuditLogTable";

export default function Page() {
    return (
        <AuditLogTable
            domain="all"
            showResourceTypeSearch
            title="Audit Log"
            description="Every privileged action across the site, newest first. Click a row for before/after state."
        />
    );
}
