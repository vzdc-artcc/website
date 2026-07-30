import React from 'react';
import CategoryOrderView from "@/components/PerformanceIndicatorCategory/CategoryOrderView";

export default async function Page({params}: { params: Promise<{ id: string }> }) {

    const {id} = await params;

    return <CategoryOrderView templateId={id}/>;
}
