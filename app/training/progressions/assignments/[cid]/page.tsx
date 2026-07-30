import React from 'react';
import ProgressionAssignmentEditView from "@/components/ProgressionAssignment/ProgressionAssignmentEditView";
import RequireRole from "@/components/Access/RequireRole";

export default async function Page({params}: { params: Promise<{ cid: string }> }) {

    const {cid} = await params;

    return (
        <RequireRole check="isStaff">
            <ProgressionAssignmentEditView cid={cid}/>
        </RequireRole>
    );
}
