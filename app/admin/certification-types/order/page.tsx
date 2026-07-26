'use client';
import React from 'react';
import {Card, CardContent, Skeleton, Typography} from "@mui/material";
import OrderList, {OrderItem} from "@/components/Order/OrderList";
import {useCertificationTypes, useReorderCertificationTypes} from "@/lib/osmium/hooks/certifications";

export default function Page() {

    const {data, isLoading} = useCertificationTypes();
    const reorder = useReorderCertificationTypes();
    const certificationTypes = data?.items ?? [];

    const handleSubmit = (items: OrderItem[]) => {
        reorder.mutate(items.map((item) => ({id: item.id, order: item.order})));
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Certification Types Order</Typography>
                {isLoading ? <Skeleton height={200}/> : (
                    <OrderList items={certificationTypes.map((ct) => ({
                        id: ct.id,
                        name: ct.name,
                        order: ct.sort_order,
                    }))} onSubmit={handleSubmit}/>
                )}
            </CardContent>
        </Card>
    );

}
