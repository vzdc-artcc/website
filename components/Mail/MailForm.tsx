'use client';
import React, {useState} from 'react';
import {MailGroup} from "@/app/admin/mail/page";
import {User} from "next-auth";
import {Autocomplete, Grid2, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {sendMail} from "@/actions/mail/general";
import {toast} from "react-toastify";

export default function MailForm({allUsers, groups}: { allUsers: User[], groups: MailGroup[], }) {

    const [selectedOptions, setSelectedOptions] = useState<({ group: string; name: string; ids: string[]; } | {
        name: string;
        id: string;
        group: string;
    })[]>([]);

    const options = [
        ...groups.map(group => ({...group, group: 'Groups'})),
        ...allUsers.map(user => ({
            name: `${user.firstName} ${user.lastName} (${user.cid})`,
            id: user.id,
            group: 'Controllers'
        })),
    ];

    const selectedIds = selectedOptions.flatMap(option => 'ids' in option ? option.ids : [option.id]);
    const uniqueSelectedIds = Array.from(new Set(selectedIds));

    const handleSubmit = async (formData: FormData) => {

        toast('Sending mail...  This could take a while.  Do not close this page.', {type: 'info'})

        const {ok, errors} = await sendMail(
            allUsers.filter(user => uniqueSelectedIds.includes(user.id)).map(user => user.email),
            formData.get('subject') as string,
            formData.get('replyTo') as string,
            formData.get('body') as string);

        if (errors) {
            toast(errors.map(e => e.message).join('. '), {type: 'error'});
            return;
        }

        if (ok) {
            toast('Mail sent!', {type: 'success'});
            setSelectedOptions([]);
        }

    }

    return (
        (<form action={handleSubmit}>
            <input type="hidden" name="to" value={uniqueSelectedIds}/>
            <Grid2 container columns={2} spacing={2}>
                <Grid2
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <Autocomplete
                        id="group-user-autocomplete"
                        options={options}
                        groupBy={(option) => option.group}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                            setSelectedOptions(newValue);
                        }}
                        value={selectedOptions}
                        renderInput={(params) => <TextField {...params} label="Recipients" variant="outlined"/>}
                        multiple
                        disableCloseOnSelect
                    />
                </Grid2>
                <Grid2
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <TextField required fullWidth variant="filled" name="subject" label="Subject"/>
                </Grid2>
                <Grid2 size={2}>
                    <TextField required fullWidth variant="filled" name="replyTo" label="Reply To"/>
                </Grid2>
                <Grid2 size={2}>
                    <TextField required fullWidth multiline rows={5} variant="filled" name="body"
                               label="Body"/>
                </Grid2>
                <Grid2 size={2}>
                    <FormSaveButton/>
                </Grid2>
            </Grid2>
        </form>)
    );
}