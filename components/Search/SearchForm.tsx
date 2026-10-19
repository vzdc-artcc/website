'use client';
import React from 'react';
import {usePathname, useRouter} from "next/navigation";
import {Box, Button, Stack, TextField} from "@mui/material";

export default function SearchForm({label, q}: { label: string, q?: string, }) {

    const router = useRouter();
    const pathname = usePathname();

    const handleSearch = async (formData: FormData) => {
        const searchParams = new URLSearchParams();
        searchParams.set('q', formData.get('q') as string);
        router.push(`${pathname}?${searchParams.toString()}`);
    }

    return (
        <form action={handleSearch}>
            <Stack direction={{xs: 'column', md: 'row'}} spacing={1} sx={{
                alignItems: "center"
            }}>
                <TextField fullWidth variant="filled" name="q" label={label} defaultValue={q || ''}/>
                <Box>
                    <Button type="submit" variant="contained">Search</Button>
                </Box>
            </Stack>
        </form>
    );

}