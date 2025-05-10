'use client';
import React, {useState} from 'react';
import {CertificationOption, CertificationType, Lesson, LessonRosterChange} from "@prisma/client";
import Form from "next/form";
import {Autocomplete, Box, FormControl, InputLabel, MenuItem, Select, Stack, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {createOrUpdateLessonRosterChange} from '@/actions/lessonRosterChange';
import {toast} from "react-toastify";

export type LessonRosterChangeWithAll = LessonRosterChange & {
    certificationType: CertificationType,
}

export default function RosterChangeForm({lesson, rosterChange, allCertificationTypes, onSubmit}: {
    lesson: Lesson,
    rosterChange?: LessonRosterChangeWithAll,
    allCertificationTypes: CertificationType[],
    onSubmit?: () => void
}) {

    const [certificationType, setCertificationType] = useState<CertificationType | undefined>(rosterChange?.certificationType);
    const [certificationOption, setCertificationOption] = useState<CertificationOption | undefined>(rosterChange?.certificationOption);

    const handleSubmit = async (formData: FormData) => {
        const {errors} = await createOrUpdateLessonRosterChange(formData);

        if (errors) {
            toast.error(errors.map((error) => error.message).join('. '));
            return;
        }

        toast.success('Roster change saved successfully!');
        setCertificationType(undefined);
        setCertificationOption(undefined);
        if (onSubmit) {
            onSubmit();
        }
    }

    return (
        <Form action={handleSubmit}>
            <input type="hidden" name="id" value={rosterChange?.id || ''}/>
            <input type="hidden" name="lessonId" value={lesson.id}/>
            <input type="hidden" name="certificationTypeId" value={certificationType?.id || ''}/>
            <input type="hidden" name="certificationOption" value={certificationOption || ''}/>
            <Stack direction="column" spacing={2}>
                <Autocomplete
                    options={allCertificationTypes}
                    disabled={!!rosterChange}
                    getOptionLabel={(option) => option.name}
                    value={certificationType}
                    onChange={(event, newValue) => setCertificationType(newValue || undefined)}
                    renderInput={(params) => (
                        <TextField {...params} label="Certification Type" variant="outlined" fullWidth/>
                    )}
                />
                <FormControl fullWidth>
                    <InputLabel id="certification-options-label">Certification Options</InputLabel>
                    <Select
                        labelId="certification-options-label"
                        id="certification-options"
                        value={certificationOption || ''}
                        label="Certification Options"
                        onChange={(event) => setCertificationOption(event.target.value as CertificationOption)}
                        disabled={!certificationType}
                        variant="filled"
                    >
                        {(certificationType?.certificationOptions || ["NONE"]).map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField fullWidth required variant="filled" name="dossierMessage" label="Dossier Entry Message"
                           helperText="The dossier entry will be authored by the trainer and the date of entry will be the end of the training session."
                           defaultValue={rosterChange?.dossierText || ''}/>
                <Box>
                    <FormSaveButton/>
                </Box>
            </Stack>
        </Form>
    );
}