'use client';
import React, {useEffect, useState} from 'react';
import {TrainingAssignment, TrainingAssignmentRequest} from "@prisma/client";
import {User} from "next-auth";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {Autocomplete, Box, Chip, CircularProgress, Stack, TextField} from "@mui/material";
import {getRating} from "@/lib/vatsim";
import {toast} from "react-toastify";
import {getPrimaryAndSecondaryStudentNumbers, saveTrainingAssignment} from "@/actions/trainingAssignment";
import {useRouter} from "next/navigation";

export default function TrainingAssignmentForm({
                                                   trainingAssignment,
                                                   otherTrainerIds,
                                                   trainingRequest,
                                                   requestStudent,
                                                   allUsers,
                                                   disabled,
                                               }: {
    trainingAssignment?: TrainingAssignment,
    otherTrainerIds?: string[],
    trainingRequest?: TrainingAssignmentRequest,
    requestStudent?: User,
    allUsers: User[],
    disabled?: boolean,
}) {
    const [student, setStudent] = useState(requestStudent?.id);
    const [primaryTrainer, setPrimaryTrainer] = useState(trainingAssignment?.primaryTrainerId);
    const [otherTrainers, setOtherTrainers] = useState(otherTrainerIds || []);
    const [allTrainers, setAllTrainers] = useState<User[] | any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchTrainerNumbers = async () => {
            const trainersWithNumbers = await Promise.all(
                allUsers
                    .filter((u) => u.roles.includes('INSTRUCTOR') || u.roles.includes('MENTOR'))
                    .map(async (u) => {
                        const nums = await getPrimaryAndSecondaryStudentNumbers(u.id);
                        return {
                            ...u,
                            ...nums,
                        };
                    })
            );
            setAllTrainers(trainersWithNumbers);
        };

        fetchTrainerNumbers().then();
    }, [allUsers]);

    const handleSubmit = async (formData: FormData) => {
        formData.set('id', trainingAssignment?.id || '');
        formData.set('trainingRequestId', trainingRequest?.id || '');
        formData.set('student', student || '');
        formData.set('primaryTrainer', primaryTrainer || '');
        formData.set('otherTrainers', otherTrainers.join(','));

        const {assignment, errors} = await saveTrainingAssignment(formData);

        if (errors) {
            toast(errors.map((error) => error.message).join('. '), {type: 'error'});
            return;
        }

        toast('Training assignment saved successfully!', {type: 'success'});
        if (!trainingAssignment || trainingRequest) {
            router.push(`/training/assignments/${assignment.id}`);
        }
    };

    return (
        <form action={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <Autocomplete
                    disabled={!!trainingRequest || !!trainingAssignment || disabled}
                    options={allUsers}
                    getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.cid})`}
                    value={allUsers.find((u) => u.id === student) || null}
                    onChange={(event, newValue) => {
                        setStudent(newValue ? newValue.id : '');
                    }}
                    renderInput={(params) => <TextField {...params} required label="Student"/>}
                />
                {allTrainers.length > 0 ? <>
                    <Autocomplete
                        options={allTrainers}
                        disabled={disabled}
                        getOptionLabel={(option) => `${getRating(option.rating)} - ${option.primary}P ${option.secondary}S - ${option.firstName} ${option.lastName} (${option.cid})`}
                        value={allTrainers.find((u) => u.id === primaryTrainer) || null}
                        onChange={(event, newValue) => {
                            setPrimaryTrainer(newValue ? newValue.id : '');
                            if (otherTrainers.includes(newValue?.id || '')) {
                                setOtherTrainers((prev) => prev.filter((id) => id !== newValue?.id));
                            }
                        }}
                        renderInput={(params) => <TextField {...params} required label="Primary Trainer"
                                                            helperText="Key: <RATING> - <# PRIMARY STUDENTS>P <# SECONDARY STUDENTS>S - <NAME + CID>"/>}
                    />
                    <Autocomplete
                        multiple
                        disabled={disabled}
                        options={allTrainers}
                        getOptionLabel={(option) => `${getRating(option.rating)} - ${option.primary}P ${option.secondary}S - ${option.firstName} ${option.lastName} (${option.cid})`}
                        value={allTrainers.filter((u) => otherTrainers.includes(u.id))}
                        onChange={(event, newValue) => {
                            if (newValue.filter((trainer) => trainer.id === primaryTrainer).length > 0) {
                                toast('Primary trainer cannot be selected as an additional trainer.', {type: 'error'});
                            } else {
                                setOtherTrainers(newValue.map((trainer) => trainer.id));
                            }
                        }}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip {...getTagProps({index})} key={index}
                                      label={`${option.firstName} ${option.lastName}`}/>
                            ))
                        }
                        renderInput={(params) => <TextField {...params} label="Other Trainers"
                                                            helperText="Key: <RATING> - <# PRIMARY STUDENTS>P <# SECONDARY STUDENTS>S - <NAME + CID>"/>}
                    />
                    {!disabled && <Box>
                        <FormSaveButton/>
                    </Box>}
                </> : <CircularProgress/>}
            </Stack>
        </form>
    );
}