import React from 'react';
import {Card, CardContent, Typography,} from "@mui/material";
import Markdown from "react-markdown";

interface TrainingSessionLike {
    enable_markdown: boolean;
    additional_comments?: string | null;
    trainer_comments?: string | null;
}

export default function TrainingMarkdownSwitch({trainingSession, trainerView}: { trainingSession: TrainingSessionLike, trainerView?: boolean }){

    return(
        <>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6">Comments</Typography>
                    {trainingSession.enable_markdown ? <Markdown>{trainingSession.additional_comments || 'N/A'}</Markdown> : <Typography variant="body1" sx={{marginTop:"16px",marginBottom:"16px", whiteSpace:"pre-wrap"}}>{trainingSession.additional_comments || 'N/A'}</Typography>}
                </CardContent>
            </Card>
            {trainerView &&
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6">Trainer Comments</Typography>
                        {trainingSession.enable_markdown ? <Markdown>{trainingSession.trainer_comments || 'N/A'}</Markdown> : <Typography variant="body1" sx={{marginTop:"16px",marginBottom:"16px", whiteSpace:"pre-wrap"}}>{trainingSession.trainer_comments || 'N/A'}</Typography>}
                    </CardContent>
                </Card>
            }
        </>
    )
}