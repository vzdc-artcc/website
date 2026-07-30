'use client';
import React, {use} from 'react';
import {Card, CardContent, Skeleton, Typography} from "@mui/material";
import OrderList, {OrderItem} from "@/components/Order/OrderList";
import {useAdminPublications, useUpdatePublication} from "@/lib/osmium/hooks/publications";

export default function Page({params}: { params: Promise<{ categoryId: string }> }) {

    const {categoryId} = use(params);
    const {data: pubsData, isLoading} = useAdminPublications();
    const update = useUpdatePublication();

    const files = (pubsData?.items ?? [])
        .filter((p) => p.category_id === categoryId)
        .sort((a, b) => a.sort_order - b.sort_order);

    const handleSubmit = async (items: OrderItem[]) => {
        await Promise.all(items.map((item) => {
            const pub = files.find((p) => p.id === item.id);
            if (!pub) return Promise.resolve();
            return update.mutateAsync({
                publicationId: pub.id,
                body: {
                    category_id: pub.category_id,
                    title: pub.title,
                    description: pub.description ?? null,
                    effective_at: pub.effective_at,
                    file_id: pub.file_id,
                    is_public: pub.is_public,
                    sort_order: item.order,
                    status: pub.status as "draft" | "published" | "archived",
                },
            });
        }));
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>File Order</Typography>
                {isLoading ? <Skeleton height={200}/> : (
                    <OrderList items={files.map((f) => ({id: f.id, name: f.title, order: f.sort_order}))}
                               onSubmit={handleSubmit}/>
                )}
            </CardContent>
        </Card>
    );
}
