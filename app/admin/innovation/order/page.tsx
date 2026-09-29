import React from 'react';
import prisma from "@/lib/db";
import {Card, CardContent, Typography} from "@mui/material";
import OrderList from "@/components/Order/OrderList";
import {updateInnovationLabProjectOrder} from "@/actions/innovation";

export default async function Page() {

    const projects = await prisma.innovationLabProject.findMany({
        orderBy: {
            order: 'asc',
        },
    });

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Innovation Lab Order</Typography>
                <OrderList items={projects.map((p) => ({
                    id: p.id,
                    name: p.name,
                    order: p.order,
                }))} onSubmit={updateInnovationLabProjectOrder}/>
            </CardContent>
        </Card>
    );

}