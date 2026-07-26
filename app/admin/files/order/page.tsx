'use client';
import React from 'react';
import {Card, CardContent, Skeleton, Typography} from "@mui/material";
import OrderList, {OrderItem} from "@/components/Order/OrderList";
import {useAdminPublicationCategories, useUpdatePublicationCategory} from "@/lib/osmium/hooks/publications";

export default function Page() {

    const {data: categories, isLoading} = useAdminPublicationCategories();
    const update = useUpdatePublicationCategory();

    const handleSubmit = async (items: OrderItem[]) => {
        await Promise.all(items.map((item) => {
            const category = categories?.find((c) => c.id === item.id);
            if (!category) return Promise.resolve();
            return update.mutateAsync({
                categoryId: category.id,
                body: {key: category.key, name: category.name, description: category.description ?? null, sort_order: item.order},
            });
        }));
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>File Category Order</Typography>
                {isLoading ? <Skeleton height={200}/> : (
                    <OrderList items={(categories ?? []).map((c) => ({id: c.id, name: c.name, order: c.sort_order}))}
                               onSubmit={handleSubmit}/>
                )}
            </CardContent>
        </Card>
    );
}
