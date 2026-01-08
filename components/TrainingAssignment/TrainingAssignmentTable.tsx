'use client';
import React from 'react';
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/DataTable/DataTable";
import {GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import {Chip, Stack, Tooltip} from "@mui/material";
import {User} from "next-auth";
import {createDiscordTrainingChannel, fetchTrainingAssignments} from "@/actions/trainingAssignment";
import {Chat, Visibility} from "@mui/icons-material";
import TrainingAssignmentDeleteButton from "@/components/TrainingAssignment/TrainingAssignmentDeleteButton";
import {useRouter} from "next/navigation";
import {getRating} from "@/lib/vatsim";
import Link from "next/link";
import {Lesson} from "@prisma/client";
import {formatTimezoneDate, formatZuluDate, getTimeAgo, getTimeIn} from "@/lib/date";
import {toast} from "react-toastify";


export default function TrainingAssignmentTable({manageMode, timezone}: { manageMode: boolean, timezone: string }) {

    const router = useRouter();

    const columns: GridColDef[] = [
        {
            field: 'student',
            flex: 1,
            headerName: 'Student',
            renderCell: (params) => {
                const color = params.row.student.controllerStatus === "HOME" ? 'default' : 'secondary';

                return (
                    <Tooltip title={`${params.row.student.controllerStatus}`}>
                        <Link href={`/training/controller/${params.row.student.cid}`} target="_blank"
                                              style={{textDecoration: 'none',}}>
                            <Chip
                                key={params.row.student.id}
                                label={`${params.row.student.firstName} ${params.row.student.lastName}` || 'Unknown'}
                                size="small"
                                color={color}
                            />
                        </Link>
                    </Tooltip>
                )
            },
            sortable: false,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
         {
            field: 'rating',
            flex: 1,
            headerName: 'Rating',
            renderCell: (params) => getRating(params.row.student.rating),
            filterable: false,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
       {
            field: 'lastSessionDate',
            flex: 1,
            headerName: 'Last Session Date',
            renderCell: (params) => {
                const lastSession = params.row.student.trainingSessions[0];
                if (!lastSession) {
                    return 'N/A';
                }

                const lastSessionDate = new Date(lastSession.start);
                const now = new Date();
                const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
                const twoWeeksInMs = 2 * oneWeekInMs;
                let chipColor: 'success' | 'warning' | 'error' = 'success';

                if ((now.getTime() - lastSessionDate.getTime()) > twoWeeksInMs) {
                    chipColor = 'error';
                } else if ((now.getTime() - lastSessionDate.getTime()) > oneWeekInMs) {
                    chipColor = 'warning';
                }

                return (
                    <Tooltip title={formatZuluDate(lastSessionDate)}>
                        <Chip
                            label={getTimeAgo(lastSessionDate)}
                            size="small"
                            color={chipColor}
                        />
                    </Tooltip>
                );
            },
            filterable: false,
            sortable: false,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'lastSession',
            flex: 1,
            headerName: 'Last Session',
            renderCell: (params) => params.row.student.trainingSessions[0]?.tickets.map((ticket: {
                id: string,
                lesson: Lesson,
                passed: boolean,
            }) => {
                const color = ticket.passed ? 'success' : 'error';
                return (
                    <Chip
                        key={ticket.id}
                        label={ticket.lesson.identifier}
                        size="small"
                        color={color}
                        style={{margin: '2px'}}
                    />
                );
            }) || 'N/A',
            filterable: false,
            sortable: false,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'appointment',
            flex: 1,
            headerName: 'Future Session',
            filterable: false,
            sortable: false,
            renderCell: (params) => {
                const appointment = params.row.student.trainingAppointmentStudent[0];
                if (!appointment) {
                    return '';
                }

                const startDate = new Date(appointment.start);

                return (
                    <Tooltip
                        title={`${formatTimezoneDate(startDate, timezone)} with ${appointment.trainer.fullName}: ${appointment.lessons.map((l: Lesson) => l.identifier).join(', ')}`}>
                        <Link
                            href={`/training/appointments?sortField=start&sortDirection=asc&filterField=student&filterValue=${params.row.student.cid}&filterOperator=equals`}>
                            <Chip
                                label={getTimeIn(startDate)}
                                size="small"
                                color="info"
                            />
                        </Link>
                    </Tooltip>
                );
            },
        },
        {
            field: 'primaryTrainer',
            headerName: 'Primary Trainer',
            renderCell: (params) => <Link href={`/training/controller/${params.row.primaryTrainer.cid}`}
                                          target="_blank">
                <Chip
                    label={`${params.row.primaryTrainer.firstName} ${params.row.primaryTrainer.lastName} - ${getRating(params.row.primaryTrainer.rating)}`}
                    size="small"/>
            </Link>,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
            sortable: false,
            flex: 1
        },
        {
            field: 'otherTrainers',
            headerName: 'Other Trainers',
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    {params.row.otherTrainers.map((trainer: User) => (
                        <Link key={trainer.id} href={`/training/controller/${trainer.cid}`} target="_blank">
                            <Chip label={`${trainer.firstName} ${trainer.lastName} - ${getRating(trainer.rating)}`}
                                  size="small"/>
                        </Link>
                    ))}
                </Stack>
            ),
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
            sortable: false,
            flex: 1
        },
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            getActions: (params) => [
                <GridActionsCellItem
                    key={params.row.id}
                    icon={<Visibility/>}
                    label="View/Edit Assignment"
                    onClick={() => router.push(`/training/assignments/${params.row.id}`)}
                />,
                manageMode ? <GridActionsCellItem
                    key={params.row.id}
                    icon={<Chat/>}
                    label="Create Discord Channel"
                    onClick={() => createDiscordChannel(params.row.student, params.row.primaryTrainer, params.row.otherTrainers)}
                /> : <></>,
                manageMode ? <TrainingAssignmentDeleteButton key={params.row.id} assignment={params.row}/> : <></>,
            ],
            flex: 1
        },
    ];

    const createDiscordChannel = (student: User, primaryTrainer: User, otherTrainers: User[]) => {
        toast.warning("Creating Discord channel. This may take a few seconds. Do not spam the button!");

        createDiscordTrainingChannel(student, primaryTrainer, otherTrainers).then((ok) => {
            if (ok) {
                toast.success('Discord channel created successfully!');
            } else {
                toast.error('Failed to create Discord channel. Please try again later or contact the WM.');
            }
        });
    }

    return (
        <DataTable
            columns={columns}
            fetchData={async (pagination, sort, filter) => {
                const assignments = await fetchTrainingAssignments(pagination, sort, filter);
                return {data: assignments[1], rowCount: assignments[0]};
            }}
        />
    );
}