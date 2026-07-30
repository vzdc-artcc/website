'use client';
import React, {useState} from 'react';
import {CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography} from "@mui/material";
import Link from "next/link";
import {toast} from "react-toastify";
import {getIconForCertificationOption} from "@/lib/certification";
import {z} from "zod";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {
    useCertificationTypes,
    useSaveUserCertifications,
    useUserCertifications,
    useUserSoloCertifications,
} from "@/lib/osmium/hooks/certifications";

export default function CertificationForm({cid}: { cid: number }) {

    const {data: typesData, isLoading: typesLoading} = useCertificationTypes();
    const {data: certsData, isLoading: certsLoading} = useUserCertifications(cid);
    const {data: soloData} = useUserSoloCertifications(cid);
    const save = useSaveUserCertifications(cid);

    const certificationTypes = typesData?.items ?? [];
    const certifications = certsData?.items ?? [];
    const soloCertifications = soloData?.items ?? [];

    const getOptionForType = (typeId: string) =>
        certifications.find((c) => c.certification_type_id === typeId)?.certification_option;
    const getSoloForType = (typeId: string) =>
        soloCertifications.find((s) => s.certification_type_id === typeId);

    const [selections, setSelections] = useState<Record<string, string>>({});
    const [dossier, setDossier] = useState('');

    const handleSubmit = async () => {
        const dossierZ = z.string().min(1);
        if (!dossierZ.safeParse(dossier).success) {
            toast('Dossier entry is required!', {type: 'error',});
            return;
        }
        // Skip types with an active solo cert (managed separately); send the
        // rest with their selected option (default NONE).
        const payload = certificationTypes
            .filter((type) => !getSoloForType(type.id))
            .map((type) => ({
                certification_type_id: type.id,
                certification_option: selections[type.id] ?? getOptionForType(type.id) ?? "NONE",
            }));
        try {
            await save.mutateAsync({certifications: payload, dossier_message: dossier});
            toast(`Certifications for '${cid}' saved successfully!`, {type: 'success',});
            setDossier('');
        } catch {
            toast('Failed to save certifications.', {type: 'error',});
        }
    }

    if (typesLoading || certsLoading) {
        return <Stack alignItems="center" sx={{mt: 2,}}><CircularProgress/></Stack>;
    }

    return (
        <form action={handleSubmit}>
            <Stack direction="column" spacing={2} sx={{mt: 2,}}>
                {certificationTypes.length === 0 &&
                    <Typography textAlign="center">No certification types found. Create certification types <Link
                        href="/admin/certification-types" style={{color: 'inherit',}}>here</Link>.</Typography>}
                {certificationTypes.map((certificationType) => {
                    const soloCertification = getSoloForType(certificationType.id);
                    const isSolo = Boolean(soloCertification);
                    const currentValue = isSolo
                        ? 'SOLO'
                        : selections[certificationType.id] ?? getOptionForType(certificationType.id) ?? '';
                    return (
                        <FormControl key={certificationType.id} fullWidth>
                            <InputLabel id={certificationType.id + 'label'}>{certificationType.name}</InputLabel>
                            <Select
                                variant="filled"
                                labelId={certificationType.id + 'label'}
                                id={certificationType.id}
                                value={currentValue}
                                label="Certification"
                                name={certificationType.id}
                                disabled={isSolo}
                                onChange={(e) => setSelections((prev) => ({
                                    ...prev,
                                    [certificationType.id]: e.target.value,
                                }))}>
                                {certificationType.certification_options.map((certificationOption) => (
                                    <MenuItem key={certificationOption} value={certificationOption}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {getIconForCertificationOption(certificationOption)}
                                            <Typography>
                                                {certificationOption}
                                            </Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                                {isSolo && <MenuItem value="SOLO">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {getIconForCertificationOption('SOLO')}
                                        <Typography>
                                            SOLO (revoke solo to change)
                                        </Typography>
                                    </Stack>
                                </MenuItem>}
                            </Select>
                        </FormControl>
                    );
                })}
                {certificationTypes.length > 0 &&
                    <TextField variant="filled" fullWidth label="Dossier Entry*" name="dossier"
                               value={dossier} onChange={(e) => setDossier(e.target.value)}/>}
                {certificationTypes.length > 0 &&
                    <FormSaveButton/>}
            </Stack>

        </form>
    );
}
