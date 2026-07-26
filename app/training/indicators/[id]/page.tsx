import React from 'react';
import PerformanceIndicatorEditView from "@/components/PerformanceIndicator/PerformanceIndicatorEditView";
import RequireRole from "@/components/Access/RequireRole";

export default async function Page({params}: { params: Promise<{ id: string }> }) {

    const {id} = await params;

    return (
        <RequireRole check="isStaff">
            <PerformanceIndicatorEditView templateId={id}/>
        </RequireRole>
    );
}
