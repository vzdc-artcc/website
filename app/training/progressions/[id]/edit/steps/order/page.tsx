import React from 'react';
import TrainingProgressionStepOrderView from "@/components/TrainingProgressionStep/TrainingProgressionStepOrderView";

export default async function Page({params}: { params: Promise<{ id: string }> }) {

    const {id} = await params;

    return <TrainingProgressionStepOrderView progressionId={id}/>;
}
