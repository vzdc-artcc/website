import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {Box, Button, Card, CardContent, IconButton, Stack, Typography} from "@mui/material";
import PerformanceIndicatorForm from "@/components/PerformanceIndicator/PerformanceIndicatorForm";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import PerformanceIndicatorCategoryForm
    from "@/components/PerformanceIndicatorCategory/PerformanceIndicatorCategoryForm";
import Link from "next/link";
import {Reorder} from "@mui/icons-material";
import PerformanceIndicatorCategoryEditButton
    from "@/components/PerformanceIndicatorCategory/PerformanceIndicatorCategoryEditButton";
import PerformanceIndicatorCategoryDeleteButton
    from "@/components/PerformanceIndicatorCategory/PerformanceIndicatorCategoryDeleteButton";
import PerformanceIndicatorCriteriaDialogForm
    from "@/components/PerformanceIndicatorCriteria/PerformanceIndicatorCriteriaDialogForm";
import CriteriaTable from "@/components/PerformanceIndicatorCategory/CriteriaTable";

export default async function Page({params}: { params: Promise<{ id: string }> }) {

    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles.includes("STAFF")) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5">You must be staff to access this page.</Typography>
                </CardContent>
            </Card>
        );
    }

    const {id} = await params;

    const performanceIndicator = await prisma.performanceIndicatorTemplate.findUnique({
        where: {
            id,
        },
        include: {
            categories: {
                orderBy: {
                    order: 'asc',
                },
                include: {
                    criteria: {
                        orderBy: {
                            order: 'asc',
                        },
                    },
                },
            },
        },
    });

    if (!performanceIndicator) {
        notFound();
    }


    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5">Edit Performance Indicator - {performanceIndicator.name}</Typography>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1
                        }}>
                        <Typography variant="h6">General Information</Typography>
                        <Link href={`/training/indicators/${performanceIndicator.id}/order`}
                              style={{color: 'inherit',}}>
                            <Button startIcon={<Reorder/>} variant="outlined" color="inherit" size="small">
                                Categories
                            </Button>
                        </Link>
                    </Stack>
                    <PerformanceIndicatorForm performanceIndicator={performanceIndicator}/>
                </CardContent>
            </Card>
            {performanceIndicator.categories.map((category, idx) => (
                <Card key={category.id}>
                    <CardContent>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                justifyContent: "space-between",
                                mb: 1
                            }}>
                            <Typography variant="h6">{++idx} - {category.name}</Typography>
                            <Box>
                                <Link href={`/training/indicators/${performanceIndicator.id}/${category.id}/order`}
                                      style={{color: 'inherit',}}>
                                    <IconButton>
                                        <Reorder/>
                                    </IconButton>
                                </Link>
                                <PerformanceIndicatorCriteriaDialogForm category={category}/>
                                <PerformanceIndicatorCategoryEditButton template={performanceIndicator}
                                                                        category={category}/>
                                <PerformanceIndicatorCategoryDeleteButton category={category}/>
                            </Box>
                        </Stack>
                        <CriteriaTable criteria={category.criteria} category={category}/>
                    </CardContent>
                </Card>
            ))}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>New Category</Typography>
                    <PerformanceIndicatorCategoryForm template={performanceIndicator}/>
                </CardContent>
            </Card>
        </Stack>
    );
}