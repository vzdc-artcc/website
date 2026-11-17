import React from 'react';
import {Card, CardContent, Chip, Grid, Stack, Typography} from "@mui/material";
import {East, South} from "@mui/icons-material";
import Link from "next/link";
import {formatZuluDate} from "@/lib/date";
import type {components} from "@/lib/osmium/generated/schema";

type ProgressionStep = components["schemas"]["ProgressionStatusStep"];

/**
 * The steps of a controller's progression, in order, each linking to the session
 * that last attempted it. Rendered as fragments inside the caller's 11-column Grid.
 */
export default function ProgressionSteps({steps, sessionHref}: {
    steps: ProgressionStep[],
    sessionHref: (sessionId: string) => string,
}) {
    return (
        <>
            {steps.map((step, i) => (
                <React.Fragment key={step.step_id}>
                    {i !== 0 &&
                        <Grid size={{
                            xs: 11,
                            md: 1,
                        }} key={`progression-arrow-${i}`}>
                            <Stack direction="column" justifyContent="center" alignItems="center"
                                   sx={{height: '100%',}}>
                                <East fontSize="large" sx={{display: {xs: 'none', md: 'inherit',}}}/>
                                <South fontSize="large" sx={{display: {md: 'none',}}}/>
                            </Stack>
                        </Grid>
                    }
                    <Grid size={{
                        xs: 11,
                        md: 4,
                        lg: 2,
                    }}>
                        <Card variant="outlined" sx={{height: '100%',}}>
                            <CardContent>
                                {step.optional ?
                                    <Typography variant="subtitle2" gutterBottom>OPTIONAL</Typography> :
                                    <Typography variant="subtitle2" gutterBottom>REQUIRED</Typography>}
                                <Link
                                    href={step.training_session_id ? sessionHref(step.training_session_id) : ''}>
                                    <Chip
                                        label={step.lesson_identifier}
                                        size="medium"
                                        color={step.passed ? 'success' : step.training_session_id ? 'error' : 'default'}
                                    />
                                </Link>
                                <Typography variant="subtitle1" gutterBottom>{step.lesson_name}</Typography>
                                {step.session_end ? <Typography
                                        variant="subtitle2">Attempted {formatZuluDate(new Date(step.session_end))}</Typography> :
                                    <Typography variant="subtitle2">Never Attempted</Typography>}
                            </CardContent>
                        </Card>

                    </Grid>
                </React.Fragment>
            ))}
        </>
    );
}
