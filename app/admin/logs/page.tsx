import React from 'react';
import AuditLogTable from "@/components/Logs/AuditLogTable";

export default function Page() {
    return (
        <AuditLogTable
            domain="facility"
            title="Facility Logs"
            description="Facility administration activity, newest first. Click a row for before/after state."
        />
    );
}
