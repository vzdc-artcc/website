'use client';
import React from 'react';
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/DataTable/DataTable";
import {fetchLessons} from "@/actions/lesson";
import {GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import {User} from "next-auth";
import {Tooltip} from "@mui/material";
import {Edit, Visibility} from "@mui/icons-material";
import LessonDeleteButton from "@/components/Lesson/LessonDeleteButton";
import {useRouter} from "next/navigation";

export default function LessonTable({user}: { user: User }) {

    const router = useRouter();

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'identifier',
            headerName: 'Identifier',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'facility',
            headerName: 'Facility',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'position',
            headerName: 'Position',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {field: 'instructorOnly', headerName: 'OTS', type: 'boolean', flex: 1},
        {field: 'notifyInstructorOnPass', headerName: 'Notify Instructors On Pass', type: 'boolean', flex: 1},
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            flex: 1,
            getActions: (params) => [
                <Tooltip title="View Lesson" key={`view-${params.row.id}`}>
                    <GridActionsCellItem
                        icon={<Visibility/>}
                        label="View Lesson"
                        onClick={() => router.push(`/training/lessons/${params.row.id}`)}
                    />
                </Tooltip>,
                user.roles.includes("STAFF") ? (
                    <>
                        <Tooltip title="Edit Lesson" key={`edit-${params.row.id}`}>
                            <GridActionsCellItem
                                icon={<Edit/>}
                                label="Edit Lesson"
                                onClick={() => router.push(`/training/lessons/${params.row.id}/edit`)}
                            />
                        </Tooltip>
                        <LessonDeleteButton lesson={params.row} key={`delete-${params.row.id}`}/>
                    </>
                ) : <></>,
            ],
        },
    ];

    return (
        <DataTable columns={columns} initialSort={[{field: 'identifier', sort: 'asc',}]}
                   fetchData={async (pagination, sortModel, filter) => {
                       const lessons = await fetchLessons(pagination, sortModel, filter);
                       return {
                           data: lessons[1],
                           rowCount: lessons[0],
                       };
                   }}/>
    );

}