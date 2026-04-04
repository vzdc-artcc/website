"use client";

import React, {useEffect, useState} from "react";
import {Button, Grid} from "@mui/material";
import Form from "next/form";
import {toast} from "react-toastify";
import FormSaveButton from "../Form/FormSaveButton";
import MarkdownEditor from "@uiw/react-markdown-editor";
import {Event, EventPosition, User} from "@/generated/prisma/browser";
import {saveOpsPlanFreeText} from "@/actions/eventPosition";

export default function OpsPlanFreeTextForm({
                                                admin,
                                                currentUser,
                                                event,
                                                eventPosition,
                                            }: {
    admin?: boolean;
    currentUser: User;
    event: Event;
    eventPosition?: EventPosition | null;
}) {
    const [text, setText] = useState<string>("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        try {
            const opsFromEvent = (event as any)?.opsFreeText;
            if (typeof opsFromEvent === "string" && opsFromEvent.length > 0) {
                setText(opsFromEvent);
                return;
            }

            const configs = (event as any)?.featuredFieldConfigs ?? {};
            const legacy = configs?.OPS_FREE_TEXT ?? configs?.opsFreeText ?? "";
            if (typeof legacy === "string") {
                setText(legacy);
            } else if (legacy != null) {
                setText(JSON.stringify(legacy, null, 2));
            } else {
                setText("");
            }
        } catch (e) {
            console.error("OpsPlanFreeTextForm: failed to parse initial content", e);
            setText("");
        }
    }, [event?.id, (event as any)?.opsFreeText, (event as any)?.featuredFieldConfigs]);

    const handleSubmit = async (formData: FormData) => {
        if (!admin && (eventPosition || event.positionsLocked)) {
            toast.error("You do not have permission to update the OPS free text for this event.");
            return;
        }

        setSaving(true);
        try {
            formData.set("eventId", event.id);
            formData.set("opsFreeText", String(text || ""));

            const res = await saveOpsPlanFreeText(event, formData, admin);

            if ((res as any)?.errors) {
                const errMsg = ((res as any).errors || []).map((e: any) => e.message).join(". ");
                toast.error(errMsg || "Failed to save OPS free text.");
            } else {
                const updatedEvent = (res as any)?.event;
                if (updatedEvent && typeof updatedEvent.opsFreeText === "string") {
                    setText(updatedEvent.opsFreeText);
                }
                toast.success("OPS free text saved.");
            }
        } catch (err) {
            console.error("OpsPlanFreeTextForm.save error", err);
            toast.error("Unexpected error saving OPS free text.");
        } finally {
            setSaving(false);
        }
    };

    const saveDisabled = saving || (!admin && (eventPosition || event.positionsLocked));

    return (
        <Form action={handleSubmit}>
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
                    {saveDisabled ? (
                        <Button variant="contained" disabled>
                            Save
                        </Button>
                    ) : (
                        <FormSaveButton text="Save" />
                    )}
                </Grid>
            </Grid>
        </Form>
    );
}
