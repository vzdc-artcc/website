import React from 'react';
import AuditLogTable from "@/components/Logs/AuditLogTable";

export default function Page() {
    return (
        <AuditLogTable
            domain="training"
            title="Training Logs"
            description="Training activity in this facility, newest first. Click a row for before/after state."
        />
    );
}
