'use client';
import React, {useEffect, useState} from 'react';
import Form from "next/form";
import {Box, Stack, Typography, useTheme} from "@mui/material";
import MarkdownEditor from "@uiw/react-markdown-editor";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {useUpdateWelcomeMessageContent, useWelcomeMessageContent} from "@/lib/osmium/hooks/welcome-messages";
import {toast} from "react-toastify";

export default function WelcomeMessagesForm() {

    const theme = useTheme();
    const {data} = useWelcomeMessageContent();
    const updateWelcomeMessageContent = useUpdateWelcomeMessageContent();
    const [homeText, setHomeText] = useState('');
    const [visitorText, setVisitorText] = useState('');
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (data && !initialized) {
            setHomeText(data.home_text);
            setVisitorText(data.visitor_text);
            setInitialized(true);
        }
    }, [data, initialized]);

    const handleSubmit = async () => {
        try {
            await updateWelcomeMessageContent.mutateAsync({home_text: homeText, visitor_text: visitorText});
            toast.success("Welcome messages updated successfully!");
        } catch {
            toast('Failed to update welcome messages', {type: 'error'});
        }
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
