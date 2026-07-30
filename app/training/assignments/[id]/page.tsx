import React from 'react';
import TrainingAssignmentDetailView from "@/components/TrainingAssignment/TrainingAssignmentDetailView";

export default async function Page(props: { params: Promise<{ id: string, }> }) {
    const {id} = await props.params;
    return <TrainingAssignmentDetailView assignmentId={id}/>;
}
