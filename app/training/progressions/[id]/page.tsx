import React from 'react';
import TrainingProgressionDetailView from "@/components/TrainingProgression/TrainingProgressionDetailView";

export default async function Page({params}: { params: Promise<{ id: string }> }) {

    const {id} = await params;

    return <TrainingProgressionDetailView progressionId={id}/>;
}
