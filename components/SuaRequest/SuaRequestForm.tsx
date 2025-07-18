'use client';
import React, {useState} from 'react';
import {User} from "next-auth";
import {
    Grid2,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import RequestSubmitButton from "@/components/StaffingRequest/RequestSubmitButton";
import {useRouter} from "next/navigation";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {createSuaRequest} from "@/actions/sua";
import {toast} from "react-toastify";

export default function SuaRequestForm({user, allSuas}: { user: User, allSuas: string[] }) {

    const router = useRouter();
    const [start, setStart] = useState<Date | string>(new Date());
    const [end, setEnd] = useState<Date | string>(new Date());

    const handleSubmit = async (formData: FormData) => {

        formData.set('start', dayjs.utc(start).toISOString());
        formData.set('end', dayjs.utc(end).toISOString());

        const {mission, errors} = await createSuaRequest(formData);

        if (errors) {
            toast.error(errors.map((e: { message: string }) => e.message).join(', '));
            return;
        }


        router.push(`/sua/details?missionId=${mission?.id}`);
    }

    dayjs.extend(utc);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <form action={handleSubmit}>
                <input type="hidden" name="userId" value={user.id}/>
                <Grid2 container columns={2} spacing={2}>
                    <Grid2
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <TextField fullWidth variant="filled" name="pilotName" label="Your Name"
                                   defaultValue={user.fullName} disabled/>
                    </Grid2>
                    <Grid2
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <TextField fullWidth variant="filled" name="pilotEmail" label="Your Email"
                                   defaultValue={user.email} disabled/>
                    </Grid2>
                    <Grid2
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <TextField fullWidth variant="filled" name="pilotCid" label="Your VATSIM CID"
                                   defaultValue={user.cid} disabled/>
                    </Grid2>
                    <Grid2
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <TextField fullWidth variant="filled" name="afiliation" label="Afiliation" required
                                   helperText="Which organziation you are asssociated with."/>
                    </Grid2>
                    <Grid2
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <DateTimePicker ampm={false} label="Start" value={dayjs.utc(start)}
                                        onChange={(d) => setStart(d?.toDate() || new Date())}/>
                    </Grid2>
                    <Grid2
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <DateTimePicker ampm={false} label="End" value={dayjs.utc(end)}
                                        onChange={(d) => setEnd(d?.toDate() || new Date())}/>
                    </Grid2>
                    <Grid2 size={2}>
                        <TextField fullWidth required multiline rows={5} variant="filled" name="details"
                                   label="Details"
                                   helperText="Include any information that might be helpful to the controller.  You can block airspace below."/>
                    </Grid2>
                    <Grid2 size={2}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>SUA</TableCell>
                                        <TableCell>Bottom (in FL)</TableCell>
                                        <TableCell>Top (in FL)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allSuas.map((sua) => (
                                        <TableRow key={sua}>
                                            <TableCell>
                                                <Typography variant="body1">{sua}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    name={`airspace.${sua}.bottom`}
                                                    type="text"
                                                    size="small"
                                                    placeholder="005, 050, or 500 (leave blank if unused)"
                                                    fullWidth
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    name={`airspace.${sua}.top`}
                                                    type="text"
                                                    size="small"
                                                    placeholder="005, 050, or 500 (leave blank if unused)"
                                                    fullWidth
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid2>
                    <Grid2 size={2}>
                        <RequestSubmitButton/>
                    </Grid2>
                </Grid2>
            </form>
        </LocalizationProvider>
    );
}