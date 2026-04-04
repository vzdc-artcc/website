'use client';
import React, {useState} from 'react';
import {ChangeBroadcast, File} from "@/generated/prisma/browser";
import Form from "next/form";
import {Autocomplete, FormControlLabel, Grid, Switch, TextField, Typography} from "@mui/material";
import {MailGroup} from "@/app/admin/mail/page";
import MarkdownEditor from "@uiw/react-markdown-editor";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {createOrUpdateBroadcast} from "@/actions/broadcast";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function BroadcastForm({broadcast, file, allFiles, groups,}: {
    broadcast?: ChangeBroadcast,
    file?: File,
    allFiles: File[],
    groups: MailGroup[],
}) {

    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<File | undefined>(file);
    const [description, setDescription] = useState<string>(broadcast?.description || '');
    const [selectedOptions, setSelectedOptions] = useState<({ group: string; name: string; ids: string[]; } | {
        name: string;
        id: string;
        group: string;
    })[]>([]);

    const options = [
        ...groups.map(group => ({...group, group: 'Groups'})),
    ];

    const selectedIds = selectedOptions.flatMap(option => 'ids' in option ? option.ids : [option.id]);
    const uniqueSelectedIds = Array.from(new Set(selectedIds));

    const handleSubmit = async (formData: FormData) => {
        formData.set('file', selectedFile?.id || '');
        formData.set('description', description);

        const {errors} = await createOrUpdateBroadcast(formData);

        if (errors) {
            toast.error(errors.map(e => e.message).join('. '));
            return;
        }

        toast.success('Broadcast saved.');
        if (!broadcast) {
            router.push('/admin/broadcasts');
        }
    }

    return (
        <Form action={handleSubmit}>
            <input type="hidden" name="id" value={broadcast?.id}/>
            <input type="hidden" name="users" value={uniqueSelectedIds}/>
            <Grid container columns={2} spacing={2}>
                {!broadcast && <Grid size={2}>
                    <Autocomplete
                        id="group-user-autocomplete"
                        options={options}
                        groupBy={(option) => option.group}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                            setSelectedOptions(newValue);
                        }}
                        value={selectedOptions}
                        renderInput={(params) => <TextField {...params} label="Broadcast To" variant="filled"
                                                            helperText="You cannot change this later."/>}
                        multiple
                        disableCloseOnSelect
                    />
                </Grid>}
                <Grid size={2}>
                    <TextField fullWidth variant="filled" name="title" label="Title"
                               defaultValue={broadcast?.title || ''}/>
                </Grid>
                <Grid size={2}>
                    <Typography gutterBottom>Description:</Typography>
                    <MarkdownEditor
                        enableScroll={false}
                        minHeight="200px"
                        value={description}
                        onChange={(d) => setDescription(d)}
                    />
                </Grid>
                {!broadcast && <Grid size={2}>
                    <FormControlLabel name="exemptStaff"
                                      control={<Switch/>}
                                      label="Exempt 'STAFF'? (Cannot be changed later)"/>
                </Grid>}
                <Grid size={2}>
                    <Autocomplete
                        id="file-autocomplete"
                        options={allFiles}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                            setSelectedFile(newValue || undefined);
                        }}
                        value={selectedFile}
                        renderInput={(params) => <TextField {...params} label="File (optional)" variant="filled"/>}
                    />
                </Grid>
                <Grid size={2}>
                    <FormSaveButton/>
                </Grid>
            </Grid>
        </Form>
    );
}