'use client';
import React, {useState} from 'react';
import {InnovationLabProject} from "@/generated/prisma/browser";
import Form from "next/form";
import {Box, Stack, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import MarkdownEditor from "@uiw/react-markdown-editor";
import {createOrUpdateInnovationLabProject} from "@/actions/innovation";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function InnovationLabProjectForm({project}: { project?: InnovationLabProject }) {

    const router = useRouter();
    const [name, setName] = useState(project?.name || '');
    const [alias, setAlias] = useState(project?.alias || '');
    const [description, setDescription] = useState(project?.description || '');

    const handleSubmit = async () => {
        const {project: createdProject, errors} = await createOrUpdateInnovationLabProject({
            id: project?.id,
            name,
            alias,
            description,
        });

        if (errors) {
            toast.error(errors.map((e) => e.message).join('. '));
            return;
        }

        if (!project) {
            toast.success(`Created innovation project ${createdProject.name}`);
            router.push(`/admin/innovation/`);
        } else {
            toast.success(`Updated innovation project ${createdProject.name}`);
        }
    }

    return (
        <Form action={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <TextField fullWidth variant="filled" label="Name" value={name}
                           onChange={(e) => setName(e.target.value)}/>
                <TextField fullWidth variant="filled" label="Alias" value={alias}
                           helperText="Must be unique to all projects.  /innovation/:alias will be the URL for this project."
                           onChange={(e) => setAlias(e.target.value)}/>
                <MarkdownEditor
                    enableScroll={false}
                    minHeight="400px"
                    value={description}
                    onChange={(d) => setDescription(d)}
                />
                <Box>
                    <FormSaveButton/>
                </Box>
            </Stack>
        </Form>
    );
}