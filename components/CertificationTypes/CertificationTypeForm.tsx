'use client';
import React, {useState} from 'react';
import {CertificationOption, CertificationType} from "@prisma/client";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";
import {createOrUpdateCertificationType} from "@/actions/certificationTypes";
import {Autocomplete, FormControlLabel, Stack, Switch, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";

export default function CertificationTypeForm({certificationType}: { certificationType?: CertificationType }) {

    const [availableOptions, setAvailableOptions] = useState<CertificationOption[]>(certificationType?.certificationOptions.filter((co) => !['NONE', 'SOLO'].includes(co)) || []);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {

        formData.set('certificationOptions', ["NONE", ...availableOptions] as any);

        const {certificationType, errors} = await createOrUpdateCertificationType(formData);

        if (errors) {
            toast(errors.map((e) => e.message).join(".  "), {type: 'error'});
            return;
        }

        router.push('/admin/certification-types');
        toast(`Certification type '${certificationType.name}' saved successfully!`, {type: 'success'})
    }



    return (
        <form action={handleSubmit}>
            <input type="hidden" name="id" value={certificationType?.id}/>
            <Stack direction="column" spacing={2}>
                <TextField variant="filled" name="name" label="Name" defaultValue={certificationType?.name || ''}/>
                {/*<TextField variant="filled" type="number" name="order" label="Order"*/}
                {/*           defaultValue={certificationType?.order || 0}*/}
                {/*           helperText="Lower number will put this certification higher in lists or first in table columns."/>*/}
                <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={Object.keys(CertificationOption).filter((co) => !['NONE', 'SOLO'].includes(co)) as CertificationOption[]}
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
                                  control={<Switch defaultChecked={certificationType?.canSoloCert}/>}
                                  label="Can get solo certified?"/>
                <FormControlLabel name="autoAssignUnrestricted"
                                  control={<Switch defaultChecked={certificationType?.autoAssignUnrestricted}/>}
                                  label="Auto certify for rating?"/>
                <FormSaveButton />
            </Stack>
        </form>
    );
}