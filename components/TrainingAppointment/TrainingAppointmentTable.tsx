'use client';
import React from 'react';
import {GridColDef} from "@mui/x-data-grid";
import Link from "next/link";
import {Chip} from "@mui/material";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/DataTable/DataTable";
import {formatEasternDate} from "@/lib/date";
import {Lesson, StaffPosition} from "@prisma/client";
import {fetchTrainingAppointments} from "@/actions/trainingAppointment";
import TrainingAppointmentDeleteButton from "@/components/TrainingAppointment/TrainingAppointmentDeleteButton";
import {User} from "next-auth";
import TrainingAppointmentInformationDialog
    from "@/components/TrainingAppointment/TrainingAppointmentInformationDialog";

export default function TrainingAppointmentTable({sessionUser}: { sessionUser: User }) {

    const columns: GridColDef[] = [
        {
            field: 'student',
            flex: 1,
            headerName: 'Student',
            renderCell: (params) => {
                return (
                    <Link href={`/training/history/${params.row.student.cid}`} target="_blank"
                          style={{textDecoration: 'none',}}>
                        <Chip
                            key={params.row.student.id}
                            label={`${params.row.student.firstName} ${params.row.student.lastName}` || 'Unknown'}
                            size="small"
                        />
                    </Link>
                )
            },
            sortable: false,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'instructor',
            flex: 1,
            headerName: 'Trainer',
            renderCell: (params) => {
                return (
                    <Chip
                        key={params.row.trainer.id}
                        label={`${params.row.trainer.firstName} ${params.row.trainer.lastName}` || 'Unknown'}
                        size="small"
                    />
                )
            },
            sortable: false,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'start',
            flex: 1,
            headerName: 'Start (Eastern Time)',
            renderCell: (params) => formatEasternDate(params.row.start),
            type: 'dateTime',
            filterable: false,
        },
        {
            field: 'duration',
            flex: 1,
            renderCell: (params) => {
                return params.row.lessons.map((l: Lesson) => l.duration)
                    .reduce((acc: number, curr: number) => acc + curr, 0);
            },
            headerName: 'Duration (mins)',
            filterable: false,
        },
        {
            field: 'environment',

            flex: 1,
            headerName: 'Environment',
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
            renderCell: (params) => {
                return (
                    <span style={{color: params.row.doubleBooking ? 'red' : 'inherit',}}>{params.row.environment}</span>
                )
            }
        },
        {
            field: 'lessons',
            flex: 1,
            headerName: 'Lesson(s)',
            sortable: false,
            renderCell: (params) => params.row.lessons.map((lesson: Lesson) => {
                return (
                    <Chip
                        key={lesson.id}
                        label={lesson.identifier}
                        size="small"
                        color="info"
                        style={{margin: '2px'}}
                    />
                );
            }),
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            getActions: (params) => [
                <TrainingAppointmentInformationDialog trainingAppointment={params.row} key={params.id}
                                                      isTrainingStaff={["TA", "ATA"].some((sp) => sessionUser.staffPositions.includes(sp as StaffPosition))}/>,
                ["TA", "ATA"].some((sp) => sessionUser.staffPositions.includes(sp as StaffPosition)) || sessionUser.cid == `${params.row.trainer.cid}` ?
                    <TrainingAppointmentDeleteButton trainingAppointment={params.row} fromAdmin/>
                    : <></>,
            ],
            flex: 1,
        }
    ];

    return (
        <DataTable
            columns={columns}
            initialSort={[{field: 'start', sort: 'asc',}]}
            fetchData={async (pagination, sortModel, filter,) => {
                const fetchedAppointments = await fetchTrainingAppointments(pagination, sortModel, filter);
                return {data: fetchedAppointments[1], rowCount: fetchedAppointments[0]};
            }}
        />
    );
}