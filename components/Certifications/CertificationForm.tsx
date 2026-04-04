'use client';
import React from 'react';
import {Certification, CertificationOption, CertificationType, SoloCertification} from "@/generated/prisma/browser";
import {FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography} from "@mui/material";
import Link from "next/link";
import {saveCertifications} from "@/actions/certifications";
import {toast} from "react-toastify";
import {getIconForCertificationOption} from "@/lib/certification";
import {z} from "zod";
import FormSaveButton from "@/components/Form/FormSaveButton";

export default function CertificationForm({cid, certificationTypes, certifications, soloCertifications}: {
    cid: string,
    certificationTypes: CertificationType[],
    certifications: Certification[],
    soloCertifications: SoloCertification[]
}) {

    const handleSubmit = async (formData: FormData) => {
        const newCertifications: Certification[] = [];
        const dossierZ = z.string().min(1);
        const dossier = dossierZ.safeParse(formData.get('dossier') as string);
        if (!dossier.success) {
            toast('Dossier entry is required!', {type: 'error',});
            return;
        }
        for (const certificationType of certificationTypes) {
            const certificationOption = formData.get(certificationType.id) as CertificationOption || "NONE";
            const certification = getCertificationForType(certifications, certificationType);
            if (certification) {
                if (certification.certificationOption !== certificationOption) {
                    certification.certificationOption = certificationOption;
                    newCertifications.push(certification);
                }
            } else {
                newCertifications.push({
                    id: '',
                    certificationOption,
                    certificationTypeId: certificationType.id,
                    userId: cid,
                });
            }
        }
        await saveCertifications(cid, newCertifications, dossier.data);
        toast(`Certifications for '${cid}' saved successfully!`, {type: 'success',});
    }

    const getCertificationForType = (certifications: Certification[], certificationType: CertificationType) => {
        return certifications.find((certification) => certification.certificationTypeId === certificationType.id);
    }

    return (
        <form action={handleSubmit}>
            <Stack direction="column" spacing={2} sx={{mt: 2,}}>
                {certificationTypes.length === 0 &&
                    <Typography textAlign="center">No certification types found. Create certification types <Link
                        href="/admin/certification-types" style={{color: 'inherit',}}>here</Link>.</Typography>}
                {certificationTypes.map((certificationType) => {
                    const soloCertification = soloCertifications.find(
                        (soloCert) => soloCert.certificationTypeId === certificationType.id
                    );
                    const isSolo = Boolean(soloCertification);
                    return (
                        <FormControl key={certificationType.id} fullWidth>
                            <InputLabel id={certificationType.id + 'label'}>{certificationType.name}</InputLabel>
                            <Select
                                variant="filled"
                                labelId={certificationType.id + 'label'}
                                id={certificationType.id}
                                defaultValue={isSolo ? 'SOLO' : getCertificationForType(certifications, certificationType)?.certificationOption || ''}
                                label="Certification"
                                name={certificationType.id}
                                disabled={isSolo}>
                                {certificationType.certificationOptions.map((certificationOption) => (
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
                    <TextField variant="filled" fullWidth label="Dossier Entry*" name="dossier"/>}
                {certificationTypes.length > 0 &&
                    <FormSaveButton />}
            </Stack>

        </form>
    );
}