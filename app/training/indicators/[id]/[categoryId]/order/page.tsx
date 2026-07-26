import React from 'react';
import CriteriaOrderView from "@/components/PerformanceIndicatorCriteria/CriteriaOrderView";

export default async function Page({params}: { params: Promise<{ id: string, categoryId: string, }> }) {

    const {categoryId} = await params;

    return <CriteriaOrderView categoryId={categoryId}/>;
}
