'use client';
import React from 'react';
import {Box, Button, Card, CardContent, CircularProgress, IconButton, Stack, Typography} from "@mui/material";
import PerformanceIndicatorForm from "@/components/PerformanceIndicator/PerformanceIndicatorForm";
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
import {usePerformanceIndicatorCategories, usePerformanceIndicatorCriteria, usePerformanceIndicatorTemplates} from "@/lib/osmium/hooks/training";

export default function PerformanceIndicatorEditView({templateId}: { templateId: string }) {

    const {data: templatesData, isLoading: templatesLoading} = usePerformanceIndicatorTemplates();
    const {data: categoriesData, isLoading: categoriesLoading} = usePerformanceIndicatorCategories();
    const {data: criteriaData, isLoading: criteriaLoading} = usePerformanceIndicatorCriteria();

    if (templatesLoading || categoriesLoading || criteriaLoading) {
        return <CircularProgress/>;
    }

    const performanceIndicator = templatesData?.items.find((t) => t.id === templateId);

    if (!performanceIndicator) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5">Performance Indicator not found.</Typography>
                </CardContent>
            </Card>
        );
    }

    const categories = (categoriesData?.items ?? [])
        .filter((c) => c.template_id === templateId)
        .sort((a, b) => a.sort_order - b.sort_order);

    const criteriaByCategory = (categoryId: string) => (criteriaData?.items ?? [])
        .filter((c) => c.category_id === categoryId)
        .sort((a, b) => a.sort_order - b.sort_order);

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5">Edit Performance Indicator - {performanceIndicator.name}</Typography>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{mb: 1,}}>
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
            {categories.map((category, idx) => (
                <Card key={category.id}>
                    <CardContent>
                        <Stack direction="row" spacing={1} justifyContent="space-between" sx={{mb: 1,}}>
                            <Typography variant="h6">{idx + 1} - {category.name}</Typography>
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
                        <CriteriaTable criteria={criteriaByCategory(category.id)} category={category}/>
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
