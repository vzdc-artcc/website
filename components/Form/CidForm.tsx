'use client';
import React, {useCallback, useEffect, useState} from 'react';
import {useParams, useRouter} from "next/navigation";
import {z} from "zod";
import {toast} from "react-toastify";
import {Autocomplete, Stack, TextField} from "@mui/material";
import {useRosterControllers} from "@/lib/osmium/hooks/users";

export default function CidForm({basePath, initialCid}: {
    basePath: string,
    initialCid?: string
}) {

    const router = useRouter();
    const params = useParams();
    const {data} = useRosterControllers();
    const controllers = data?.items ?? [];
    const [controller, setController] = useState<string>((params.cid as string) || initialCid || '');

    const handleSubmit = useCallback(() => {
        if (!controller) {
            router.push(`${basePath}`, {
                scroll: true,
            });
            return;
        }
        const cidZ = z.number().int().positive("CID must be numbers").min(1, "CID must be positive numbers");
        const result = cidZ.safeParse(Number(controller));
        if (!result.success) {
            const message = result.error.issues.map((issue) => issue.message).join(", ");
            toast(message, {type: "error"});
        } else {
            router.push(`${basePath}/${result.data}`, {
                scroll: true,
            });
        }
    }, [basePath, controller, router]);

    useEffect(() => {
        // Only navigate when the user actually changes the selected controller —
        // never on mount. Firing on mount pushed `${basePath}/${cid}` and stripped
        // nested routes like `/admin/controller/{cid}/edit` back to the base view.
        if (controller === ((params.cid as string) || initialCid || '')) {
            return;
        }
        handleSubmit();
    }, [controller, handleSubmit, initialCid, params.cid])

    return (
        (<Stack direction={{xs: 'column', md: 'row',}} spacing={2}>
            <Autocomplete
                fullWidth
                options={[...controllers].sort((a, b) => a.basic.name.localeCompare(b.basic.name))}
                getOptionLabel={(option) => `${option.basic.name} (${option.basic.cid})`}
                isOptionEqualToValue={(a, b) => a.basic.cid === b.basic.cid}
                value={controllers.find((u) => String(u.basic.cid) === controller) || null}
                onChange={(event, newValue) => {
                    setController(newValue ? String(newValue.basic.cid) : '');
                }}
                renderInput={(params) => <TextField {...params} variant="filled" label="Controller"/>}
            />
        </Stack>)
    );
}
