'use client'
import {Box, TextField, Typography, useTheme} from "@mui/material";
import MarkdownEditor from "@uiw/react-markdown-editor";
import React, {useEffect} from "react";
import {toast} from "react-toastify";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {createChangeLog} from "@/actions/changeLog";
import {useRouter} from "next/navigation";

export default function ChangeLogForm({changeLog, latestVersion,}: {
    changeLog?: { changeDetails: { id: string; detail: string; versionId: string; }[]; } & {
        id: string;
        versionNumber: string;
        createdAt: Date;
    },
    latestVersion?: string,
}) {

    const router = useRouter();
    const theme = useTheme();
    const [versionNumber, setVersionNumber] = React.useState<string>(latestVersion || '')
    const [changeLogDetails, setChangeLogDetails] = React.useState<string>('')

    const getInitialData = React.useCallback(async () => {
        if (changeLog) {
            setVersionNumber(changeLog.versionNumber);
            setChangeLogDetails(changeLog.changeDetails[0].detail)
        }
    },[changeLog])

    useEffect(() => {
        getInitialData().then();
    }, [getInitialData])

    const handleSubmit = async () => {


        const {
            errors
        } = await createChangeLog(versionNumber, changeLogDetails, changeLog?.id);

        if(typeof errors === "object"){
            toast(errors.map((e) => e.message).join(". "), {type: 'error'});
            return;
        }else if(errors){
            toast(errors,{type: 'error'});
            return;
        }
            
        router.replace(`/changelog`)
        toast("Change log saved successfully!", {type: 'success'});
    }


    return (
        <form action={handleSubmit}>
            <Box
                data-color-mode={theme.palette.mode}
                sx={{
                    marginBottom: 3
                }}>
                <TextField 
                    id="outlined-basic" 
                    label="Version Number" 
                    variant="outlined" 
                    value={versionNumber}
                    onChange={(d)=>{setVersionNumber(d.target.value)}}
                />
                <br/>
                <br/>
                <Typography variant="subtitle1" sx={{mb: 1,}}>Description: </Typography>
                <MarkdownEditor
                    enableScroll={false}
                    minHeight="200px"
                    value={changeLogDetails}
                    onChange={(d) => {setChangeLogDetails(d)}}
                />
            </Box>
            <FormSaveButton/>
        </form>
    );
}