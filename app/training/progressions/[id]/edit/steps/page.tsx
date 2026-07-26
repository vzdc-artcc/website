import React from 'react';
import TrainingProgressionStepsView from "@/components/TrainingProgressionStep/TrainingProgressionStepsView";

export default async function Page({params}: { params: Promise<{ id: string }> }) {

    const {id} = await params;

    return <TrainingProgressionStepsView progressionId={id}/>;
}
