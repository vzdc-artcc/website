'use client';
import React from 'react';
import {Card, CardContent, CircularProgress, Typography} from "@mui/material";
import OrderList, {OrderItem} from "@/components/Order/OrderList";
import {
    usePerformanceIndicatorCategories,
    usePerformanceIndicatorCriteria,
    useUpdatePerformanceIndicatorCriteria
} from "@/lib/osmium/hooks/training";

export default function CriteriaOrderView({categoryId}: { categoryId: string }) {

    const {data: categoriesData, isLoading: categoriesLoading} = usePerformanceIndicatorCategories();
    const {data: criteriaData, isLoading: criteriaLoading} = usePerformanceIndicatorCriteria();
    const updateCriteria = useUpdatePerformanceIndicatorCriteria();

    if (categoriesLoading || criteriaLoading) {
        return <CircularProgress/>;
    }

    const category = categoriesData?.items.find((c) => c.id === categoryId);

    if (!category) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5">Category not found.</Typography>
                </CardContent>
            </Card>
        );
    }

    const criteria = (criteriaData?.items ?? []).filter((c) => c.category_id === categoryId);

    const handleSubmit = async (items: OrderItem[]) => {
        for (const item of items) {
            await updateCriteria.mutateAsync({criteriaId: item.id, body: {sort_order: item.order}});
        }
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Order - Performance Indicator Criteria</Typography>
                <OrderList items={criteria.map((c) => ({id: c.id, name: c.name, order: c.sort_order,}))}
                           onSubmit={handleSubmit}/>
            </CardContent>
        </Card>
    );
}
