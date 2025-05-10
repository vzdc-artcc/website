import React from 'react';
import {
    Card,
    CardContent,
    Grid2,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import Link from "next/link";
import {ArrowBack, Edit} from "@mui/icons-material";
import LessonRubricCriteriaDeleteButton from "@/components/Lesson/LessonRubricCriteriaDeleteButton";
import LessonForm from "@/components/Lesson/LessonForm";
import LessonRubricCriteriaForm from "@/components/Lesson/LessonRubricCriteriaForm";
import LessonPerformanceIndicatorForm from "@/components/Lesson/LessonPerformanceIndicatorForm";
import RosterChangeDeleteButton from "@/components/LessonRosterChange/RosterChangeDeleteButton";
import RosterChangeForm from "@/components/LessonRosterChange/RosterChangeForm";
import RosterChangeEditButton from "@/components/LessonRosterChange/RosterChangeEditButton";

export default async function Page(props: { params: Promise<{ id: string, }>, }) {
    const params = await props.params;

    const {id} = params;

    const lesson = await prisma.lesson.findUnique({
        where: {
            id,
        },
        include: {
            rubric: {
                include: {
                    items: {
                        include: {
                            cells: true,
                        },
                        orderBy: {
                            criteria: 'asc',
                        }
                    },
                },
            },
            rosterChanges: {
                orderBy: {
                    certificationType: {
                        order: 'asc',
                    },
                },
                include: {
                    certificationType: true,
                },
            },
        },
    });

    const allCertificationTypes = await prisma.certificationType.findMany({
        orderBy: {
            order: 'asc',
        },
    });

    if (!lesson) {
        notFound();
    }

    return (
        <Grid2 container spacing={2} columns={2}>
            <Grid2 size={2}>
                <Card>
                    <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2,}}>
                            <Link href={`/training/lessons/`}
                                  style={{color: 'inherit',}}>
                                <Tooltip title="Go Back">
                                    <IconButton color="inherit">
                                        <ArrowBack fontSize="large"/>
                                    </IconButton>
                                </Tooltip>
                            </Link>
                            <Typography variant="h5" sx={{mb: 2,}}>{lesson.identifier} - {lesson.name}</Typography>
                        </Stack>
                        <LessonForm lesson={lesson}/>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2 size={2}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 2,}}>Performance Indicator</Typography>
                        <LessonPerformanceIndicatorForm lesson={lesson}/>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2 size={{xs: 2, md: 1,}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 1,}}>Lesson Rubric Criteria</Typography>
                        {!lesson.rubric || lesson.rubric.items.length === 0 &&
                            <Typography>No criteria found; create one below.</Typography>}
                        {lesson.rubric && lesson.rubric.items.length > 0 && <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Criteria</TableCell>
                                        <TableCell>Cells</TableCell>
                                        <TableCell>Max Points</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {lesson.rubric?.items.map((criteria) => (
                                        <TableRow key={criteria.id}>
                                            <TableCell>{criteria.criteria}</TableCell>
                                            <TableCell>{criteria.cells.length}</TableCell>
                                            <TableCell>{criteria.maxPoints}</TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/training/lessons/${lesson.id}/edit/${criteria.id}`}>
                                                    <IconButton size="small">
                                                        <Edit/>
                                                    </IconButton>
                                                </Link>
                                                <LessonRubricCriteriaDeleteButton rubricCriteria={criteria}/>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>}
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2 size={{xs: 2, md: 1,}}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 2,}}>New Lesson Rubric Criteria</Typography>
                        <LessonRubricCriteriaForm lesson={lesson}/>
                    </CardContent>
                </Card>
            </Grid2>

            <Grid2 size={{xs: 2, md: 1,}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 2,}}>Roster Modifications</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Certification Type</TableCell>
                                        <TableCell>Option</TableCell>
                                        <TableCell>Dossier Message</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {lesson.rosterChanges.map((rosterChange) => (
                                        <TableRow key={rosterChange.id}>
                                            <TableCell>{rosterChange.certificationType.name}</TableCell>
                                            <TableCell>{rosterChange.certificationOption}</TableCell>
                                            <TableCell>{rosterChange.dossierText}</TableCell>
                                            <TableCell>
                                                <RosterChangeEditButton rosterChange={rosterChange} lesson={lesson}
                                                                        allCertificationTypes={allCertificationTypes}/>
                                                <RosterChangeDeleteButton rosterChange={rosterChange}/>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2 size={{xs: 2, md: 1,}}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 2,}}>New Roster Modification</Typography>
                        <RosterChangeForm lesson={lesson} allCertificationTypes={allCertificationTypes}/>
                    </CardContent>
                </Card>
            </Grid2>
        </Grid2>
    );
}