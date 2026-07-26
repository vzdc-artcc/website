import React from 'react';
import TrainingProgressionEditView from "@/components/TrainingProgression/TrainingProgressionEditView";

export default async function Page({params}: { params: Promise<{ id: string }> }) {

    const {id} = await params;

    return <TrainingProgressionEditView progressionId={id}/>;
}
