import React from 'react';
import TrainingAssignmentRequestDetailView
    from "@/components/TrainerAssignmentRequest/TrainingAssignmentRequestDetailView";

export default async function Page(props: { params: Promise<{ id: string, }> }) {
    const {id} = await props.params;
    return <TrainingAssignmentRequestDetailView requestId={id}/>;
}
