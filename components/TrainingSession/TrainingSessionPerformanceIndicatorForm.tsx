'use client';
import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {AddComment, Edit} from "@mui/icons-material";
import {
    usePerformanceIndicatorCategories,
    usePerformanceIndicatorCriteria,
    usePerformanceIndicatorTemplates
} from "@/lib/osmium/hooks/training";

export interface PiCriterionState {
    id: string;
    name: string;
    order: number;
    marker: 'OBSERVED' | 'NOT_OBSERVED' | null;
    comments: string | null;
}

export interface PiCategoryState {
    id: string;
    name: string;
    order: number;
    criteria: PiCriterionState[];
}

export interface PiFormState {
    categories: PiCategoryState[];
}

export default function TrainingSessionPerformanceIndicatorForm({lesson, onChange}: {
    lesson: { id: string, performance_indicator_template_id?: string | null },
    onChange: (data: PiFormState) => void
}) {

    const {data: templatesData, isLoading: templatesLoading} = usePerformanceIndicatorTemplates();
    const {data: categoriesData, isLoading: categoriesLoading} = usePerformanceIndicatorCategories();
    const {data: criteriaData, isLoading: criteriaLoading} = usePerformanceIndicatorCriteria();

    const [data, setData] = useState<PiFormState>();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [comment, setComment] = useState('');
    const [openCriteria, setOpenCriteria] = useState<PiCriterionState>();

    const templateId = lesson.performance_indicator_template_id;
    const isLoading = templatesLoading || categoriesLoading || criteriaLoading;

    useEffect(() => {
        if (isLoading || !templateId) {
            setData(undefined);
            return;
        }

        const template = templatesData?.items.find((t) => t.id === templateId);
        if (!template) {
            setData(undefined);
            return;
        }

        const categories = (categoriesData?.items ?? [])
            .filter((c) => c.template_id === templateId)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((category) => ({
                id: category.id,
                name: category.name,
                order: category.sort_order,
                criteria: (criteriaData?.items ?? [])
                    .filter((c) => c.category_id === category.id)
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((criterion) => ({
                        id: criterion.id,
                        name: criterion.name,
                        order: criterion.sort_order,
                        marker: null as PiCriterionState['marker'],
                        comments: null,
                    })),
            }));

        setData({categories});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [templateId, isLoading, templatesData, categoriesData, criteriaData]);

    useEffect(() => {
        if (!data) return;
        onChange(data);
    }, [data, onChange])

    const handleObserved = (criterion: PiCriterionState) => {
        setData((prev) => {
            if (!prev) return prev;
            return {
                categories: prev.categories.map((category) => ({
                    ...category,
                    criteria: category.criteria.map((c) => c.id === criterion.id ? {
                        ...c,
                        marker: c.marker === 'OBSERVED' ? null : 'OBSERVED'
                    } : c),
                })),
            };
        });
    }

    const handleNotObserved = (criterion: PiCriterionState) => {
        setData((prev) => {
            if (!prev) return prev;
            return {
                categories: prev.categories.map((category) => ({
                    ...category,
                    criteria: category.criteria.map((c) => c.id === criterion.id ? {
                        ...c,
                        marker: c.marker === 'NOT_OBSERVED' ? null : 'NOT_OBSERVED'
                    } : c),
                })),
            };
        });
    }

    const openDialog = (c: PiCriterionState) => {
        setOpenCriteria(c);
        setComment(c.comments || '');
        setDialogOpen(true);
    }

    const saveComment = () => {
        setData((prev) => {
            if (!prev) return prev;
            return {
                categories: prev.categories.map((category) => ({
                    ...category,
                    criteria: category.criteria.map((c) => c.id === openCriteria?.id ? {...c, comments: comment} : c),
                })),
            };
        });
        setDialogOpen(false);
    }

    if (isLoading) return <CircularProgress/>;
    if (!data) return <Typography>There are no performance indicators configured for this lesson.</Typography>;

    return (
        <>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell>Criteria</TableCell>
                            <TableCell sx={{textAlign: 'center',}}>Observed</TableCell>
                            <TableCell sx={{textAlign: 'center',}}>Not Observed</TableCell>
                            <TableCell sx={{textAlign: 'center',}}>Comment</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.categories.map((category) => {
                            const {criteria} = category;

                            return criteria.map((criterion, index) => (
                                <TableRow key={criterion.id}>
                                    {index === 0 && <TableCell rowSpan={criteria.length}>{category.name}</TableCell>}
                                    <TableCell sx={{height: 40,}}>{criterion.name}</TableCell>
                                    <TableCell sx={{
                                        border: 1,
                                        cursor: 'pointer',
                                        background: criterion.marker === 'OBSERVED' ? 'rgba(69,129,255,0.44)' : 'inherit',
                                    }} onClick={() => handleObserved(criterion)}></TableCell>
                                    <TableCell sx={{
                                        border: 1,
                                        cursor: 'pointer',
                                        background: criterion.marker === 'NOT_OBSERVED' ? 'rgba(200,0,255,0.2)' : 'inherit',
                                    }} onClick={() => handleNotObserved(criterion)}></TableCell>
                                    <TableCell sx={{
                                        border: 1,
                                    }}>
                                        <Box
                                            sx={{textAlign: 'center',}}>
                                            <Tooltip title={criterion.comments || ''}>
                                                <IconButton size="small" onClick={() => openDialog(criterion)}>
                                                    {criterion.comments ? <Edit fontSize="small"/> :
                                                        <AddComment fontSize="small"/>}
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ));
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Add comment</DialogTitle>
                <DialogContent>
                    <DialogContentText>{openCriteria?.name}</DialogContentText>
                    <TextField sx={{my: 2,}} multiline rows={3} fullWidth variant="filled" label="Comment"
                               name="comment" value={comment} onChange={(e) => setComment(e.target.value)}/>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => openCriteria && saveComment()}>Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
