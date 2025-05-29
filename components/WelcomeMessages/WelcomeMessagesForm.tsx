'use client';
import React, {useState} from 'react';
import {WelcomeMessages} from "@prisma/client";
import Form from "next/form";
import {Box, Stack, Typography, useTheme} from "@mui/material";
import MarkdownEditor from "@uiw/react-markdown-editor";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {updateWelcomeMessages} from "@/actions/welcome-messages";
import {toast} from "react-toastify";

export default function WelcomeMessagesForm({existing}: { existing?: WelcomeMessages }) {

    const theme = useTheme();
    const [homeText, setHomeText] = useState(existing?.homeText || '');
    const [visitorText, setVisitorText] = useState(existing?.visitorText || '');

    const handleSubmit = async () => {
        await updateWelcomeMessages(homeText, visitorText);
        toast.success("Welcome messages updated successfully!");
    }

    return (
        <Form action={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <Box data-color-mode={theme.palette.mode}>
                    <Typography variant="subtitle1" gutterBottom>New Home Controller Message:</Typography>
                    <MarkdownEditor
                        enableScroll={false}
                        minHeight="300px"
                        value={homeText}
                        onChange={(d) => setHomeText(d)}
                    />
                </Box>
                <Box data-color-mode={theme.palette.mode}>
                    <Typography variant="subtitle1" gutterBottom>New Visiting Controller Message:</Typography>
                    <MarkdownEditor
                        enableScroll={false}
                        minHeight="300px"
                        value={visitorText}
                        onChange={(d) => setVisitorText(d)}
                    />
                </Box>
                <Box>
                    <FormSaveButton/>
                </Box>
            </Stack>
        </Form>
    );
}