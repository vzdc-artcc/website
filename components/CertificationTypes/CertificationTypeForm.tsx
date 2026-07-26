'use client';
import React, {useState} from 'react';
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";
import {Autocomplete, FormControlLabel, Stack, Switch, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {CERTIFICATION_OPTIONS, useUpsertCertificationType} from "@/lib/osmium/hooks/certifications";

export type CertificationTypeFormData = {
    id: string;
    name: string;
    can_solo_cert: boolean;
    auto_assign_unrestricted: boolean;
    certification_options: string[];
};

const SELECTABLE_OPTIONS = CERTIFICATION_OPTIONS.filter((co) => !['NONE', 'SOLO'].includes(co));

export default function CertificationTypeForm({certificationType}: { certificationType?: CertificationTypeFormData }) {

    const [availableOptions, setAvailableOptions] = useState<string[]>(
        certificationType?.certification_options.filter((co) => !['NONE', 'SOLO'].includes(co)) || []
    );
    const [name, setName] = useState(certificationType?.name || '');
    const [canSoloCert, setCanSoloCert] = useState(certificationType?.can_solo_cert ?? false);
    const [autoAssignUnrestricted, setAutoAssignUnrestricted] = useState(certificationType?.auto_assign_unrestricted ?? false);
    const router = useRouter();
    const upsert = useUpsertCertificationType();

    const handleSubmit = async () => {
        try {
            const saved = await upsert.mutateAsync({
                id: certificationType?.id,
                name,
                can_solo_cert: canSoloCert,
                auto_assign_unrestricted: autoAssignUnrestricted,
                certification_options: ["NONE", ...availableOptions],
            });
            router.push('/admin/certification-types');
            toast(`Certification type '${saved?.name}' saved successfully!`, {type: 'success'});
        } catch (e) {
            const status = (e as { status?: number })?.status;
            toast(
                status === 409
                    ? "Cannot remove an option that a lesson still grants. Fix those lessons first."
                    : "Failed to save certification type. Name must be 1–20 characters.",
                {type: 'error'}
            );
        }
    }

    return (
        <form action={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <TextField variant="filled" name="name" label="Name" value={name}
                           onChange={(e) => setName(e.target.value)}/>
                <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={SELECTABLE_OPTIONS}
                    value={availableOptions}
                    onChange={(event, newValue) => {
                        setAvailableOptions(newValue);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="filled"
                            label="Available Certification Options"
                            helperText="The order matters! You will see the first option first at any time."
                        />
                    )}>
                </Autocomplete>
                <FormControlLabel name="canSoloCert"
                                  control={<Switch checked={canSoloCert}
                                                   onChange={(e) => setCanSoloCert(e.target.checked)}/>}
                                  label="Can get solo certified?"/>
                <FormControlLabel name="autoAssignUnrestricted"
                                  control={<Switch checked={autoAssignUnrestricted}
                                                   onChange={(e) => setAutoAssignUnrestricted(e.target.checked)}/>}
                                  label="Auto certify for rating?"/>
                <FormSaveButton/>
            </Stack>
        </form>
    );
}
