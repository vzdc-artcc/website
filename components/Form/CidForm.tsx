'use client';
import React, {useCallback, useEffect, useState} from 'react';
import {useParams, useRouter} from "next/navigation";
import {z} from "zod";
import {toast} from "react-toastify";
import {Autocomplete, Stack, TextField} from "@mui/material";
import {User} from "next-auth";

export default function CidForm({basePath, controllers, initialCid}: {
    basePath: string,
    controllers: User[],
    initialCid?: string
}) {

    const router = useRouter();
    const params = useParams();
    const [controller, setController] = useState(params.cid || initialCid);

    const handleSubmit = useCallback(() => {
        if (!controller) {
            router.push(`${basePath}`, {
                scroll: true,
            });
            return;
        }
        const cidZ = z.int().positive("CID must be numbers").min(1, "CID must be positive numbers");
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
        handleSubmit();
    }, [controller, handleSubmit, initialCid])

    return (
        // <form action={handleSubmit} style={{width: '100%',}}>
        // </form>
        (<Stack direction={{xs: 'column', md: 'row',}} spacing={2}>
            <Autocomplete
                fullWidth
                options={controllers.sort((a, b) => a.lastName.localeCompare(b.lastName))}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.cid})`}
                value={controllers.find((u) => u.cid === controller) || null}
                onChange={(event, newValue) => {
                    setController(newValue ? newValue.cid : '');
                }}
                renderInput={(params) => <TextField {...params} variant="filled" label="Controller"/>}
            />
            {/*<Button type="submit" variant="contained" size="large">Search</Button>*/}
        </Stack>)
    );
}