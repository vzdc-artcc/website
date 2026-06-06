'use client';
import React from 'react';
import {User} from "next-auth";
import {Box, Button, Stack, Tab, Tabs, Typography} from "@mui/material";
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {getRating} from "@/lib/vatsim";
import {toast} from "react-toastify";
import {purgeControllers} from "@/actions/controller";
import {formatZuluDate} from "@/lib/date";

export default function PurgeAssistantTable({controllers, user}: {
    controllers: {
        controller: User,
        totalHours: number,
        totalTrainerHours: string,
        totalTrainingHours: string,
        homeController: boolean,
        openBroadcasts: number,
    }[],
    user: User,
}) {

    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const [clickedOnce, setClickedOnce] = React.useState<boolean>(false);
    const [disabled, setDisabled] = React.useState<boolean>(false);
    const [selectedRoster, setSelectedRoster] = React.useState<string>("home");

    const handlePurge = async () => {
        setDisabled(true);
        if (selectedIds.includes(user.id)) {
            toast("You cannot purge yourself.", {type: "error",});
            setDisabled(false);
            return;
        }
        if (!clickedOnce) {
            toast("THIS ACTION IS IRREVERSIBLE. Any staff positions or training positions will be removed. Click again to confirm purge.", {type: "warning",});
            setClickedOnce(true);
            setDisabled(false);
            return;
        }
        await purgeControllers(selectedIds);
        setClickedOnce(false);
        setDisabled(false);
        setSelectedIds([]);
        toast("Purge complete.", {type: "success",});
    }

    if (controllers.length === 0) {
        return <Typography>No controllers match criteria</Typography>
    }

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelectedRoster(newValue);
    }

    const columns: GridColDef[] = [
        {field: 'controller', headerName: 'Controller', flex: 1},
        {field: 'cid', headerName: 'CID', flex: 1},
        {field: 'email', headerName: 'Email', flex:1},
        {field: 'rating', headerName: 'Rating', flex: 1},
        {field: 'totalHours', headerName: 'C Hrs', flex: 1},
        {field: 'totalTrainingHours', headerName: 'Training Hrs', flex: 1},
        {field: 'totalTrainerHours', headerName: 'Trainer Hrs', flex: 1},
        {field: 'joinDate', headerName: 'Joined', flex: 1,},
        {field: 'openBroadcasts', headerName: 'Open Broadcasts', flex: 1,},
    ];

    const rows = controllers.map(({controller, totalHours, totalTrainingHours, totalTrainerHours, openBroadcasts}) => ({
        id: controller.id,
        controller: `${controller.firstName} ${controller.lastName}`,
        cid: controller.cid,
        email: controller.email,
        rating: getRating(controller.rating),
        totalHours: totalHours.toPrecision(3),
        totalTrainingHours: totalTrainingHours,
        totalTrainerHours: totalTrainerHours,
        joinDate: formatZuluDate(controller.joinDate),
        openBroadcasts,
    }));

    return (
        <Box>
            <Tabs variant="fullWidth" value={selectedRoster} onChange={handleChange}>
                <Tab label="Home" value="home"/>
                <Tab label="Visiting" value="visit"/>
            </Tabs>
            <Box hidden={selectedRoster !== "home"}>
                <DataGrid
                    initialState={{sorting: {sortModel: [{field: 'totalHours', sort: 'desc',}]}}}
                    rows={rows.filter(row => controllers.find(c => c.controller.id === row.id)?.homeController)}
                    columns={columns}
                    sortingMode="client"
                    filterMode="client"
                    disableRowSelectionOnClick
                    checkboxSelection
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectedIds(newSelection as unknown as string[]);
                    }}
                    showToolbar
                />
            </Box>
            <Box hidden={selectedRoster !== "visit"}>
                <DataGrid
                    initialState={{sorting: {sortModel: [{field: 'totalHours', sort: 'desc',}]}}}
                    rows={rows.filter(row => !controllers.find(c => c.controller.id === row.id)?.homeController)}
                    columns={columns}
                    sortingMode="client"
                    filterMode="client"
                    disableRowSelectionOnClick
                    checkboxSelection
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectedIds(newSelection as unknown as string[]);
                    }}
                    showToolbar
                />
            </Box>
            <Typography variant="h5" sx={{
                border: 4,
                borderRadius: 3,
                borderColor: 'lightgreen',
                p: 2,
                my: 1,
            }}><b>{selectedRoster.toUpperCase()}</b> ROSTER PURGE ONLY</Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{mt: 2,}}>
                <Button variant="contained" color="error"
                        disabled={disabled || selectedIds.length === 0 || !user.staffPositions.some((sp) => ["ATM", "DATM"].includes(sp))}
                        size="large"
                        sx={{mt: 2,}}
                        onClick={handlePurge}>Purge {selectedIds.length} controller{selectedIds.length === 1 ? '' : 's'}</Button>
                {clickedOnce && <Button variant="contained" color="warning" size="large" onClick={() => {
                    setDisabled(true);
                    setClickedOnce(false);
                    setDisabled(false)
                }}>Cancel</Button>}
            </Stack>
        </Box>
    );
}