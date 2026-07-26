'use client';

import React, {useEffect, useState} from "react";
import {Grid} from "@mui/material";
import {toast} from "react-toastify";
import FormSaveButton from "../Form/FormSaveButton";
import MarkdownEditor from "@uiw/react-markdown-editor";
import {useEventOpsPlan, useUpdateEventOpsPlan} from "@/lib/osmium/hooks/events";

export default function OpsPlanFreeTextForm({event}: { event: { id: string } }) {
    const {data: opsPlan} = useEventOpsPlan(event.id);
    const updateOpsPlan = useUpdateEventOpsPlan(event.id);
    const [text, setText] = useState<string>("");
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (opsPlan && !initialized) {
            setText(opsPlan.ops_free_text || "");
            setInitialized(true);
        }
    }, [opsPlan, initialized]);

    const handleSubmit = async () => {
        try {
            await updateOpsPlan.mutateAsync({ops_free_text: text});
            toast.success("OPS free text saved.");
        } catch {
            toast.error("Unexpected error saving OPS free text.");
        }
    };

    return (
        <form action={handleSubmit}>
            <Grid container spacing={2} columns={6}>
                <Grid size={6}>
                    <MarkdownEditor
                        value={text}
                        onChange={(value?: string) => setText(value ?? "")}
                        enableScroll={false}
                        minHeight="400px"
                    />
                </Grid>
                <Grid size={6}>
                    <FormSaveButton text="Save"/>
                </Grid>
            </Grid>
        </form>
    );
}
