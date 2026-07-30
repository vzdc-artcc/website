'use client';
import React from 'react';
import {Card, CardContent, CircularProgress, Typography} from "@mui/material";
import OrderList, {OrderItem} from "@/components/Order/OrderList";
import {
    usePerformanceIndicatorCategories,
    usePerformanceIndicatorTemplates,
    useUpdatePerformanceIndicatorCategory
} from "@/lib/osmium/hooks/training";

export default function CategoryOrderView({templateId}: { templateId: string }) {

    const {data: templatesData, isLoading: templatesLoading} = usePerformanceIndicatorTemplates();
    const {data: categoriesData, isLoading: categoriesLoading} = usePerformanceIndicatorCategories();
    const updateCategory = useUpdatePerformanceIndicatorCategory();

    if (templatesLoading || categoriesLoading) {
        return <CircularProgress/>;
    }

    const template = templatesData?.items.find((t) => t.id === templateId);

    if (!template) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5">Performance Indicator not found.</Typography>
                </CardContent>
            </Card>
        );
    }

    const categories = (categoriesData?.items ?? []).filter((c) => c.template_id === templateId);

    const handleSubmit = async (items: OrderItem[]) => {
        for (const item of items) {
            await updateCategory.mutateAsync({categoryId: item.id, body: {sort_order: item.order}});
        }
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Order - Performance Indicator Category</Typography>
                <OrderList
                    items={categories.map((c) => ({id: c.id, name: c.name, order: c.sort_order,}))}
                    onSubmit={handleSubmit}/>
            </CardContent>
        </Card>
    );
}
