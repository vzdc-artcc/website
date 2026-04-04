import React from 'react';
import {Card, CardContent, Typography,} from "@mui/material";
import Markdown from "react-markdown";
import {TrainingSession} from "@/generated/prisma/browser"

export default function TrainingMarkdownSwitch({trainingSession, trainerView}: { trainingSession:TrainingSession ,trainerView?: boolean }){

    return(
        <>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6">Comments</Typography>
                    {trainingSession.enableMarkdown ? <Markdown>{trainingSession.additionalComments || 'N/A'}</Markdown> : <Typography variant="body1" sx={{marginTop:"16px",marginBottom:"16px", whiteSpace:"pre-wrap"}}>{trainingSession.additionalComments || 'N/A'}</Typography>}
                </CardContent>
            </Card>
            {trainerView &&
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6">Trainer Comments</Typography>
                        {trainingSession.enableMarkdown ? <Markdown>{trainingSession.trainerComments || 'N/A'}</Markdown> : <Typography variant="body1" sx={{marginTop:"16px",marginBottom:"16px", whiteSpace:"pre-wrap"}}>{trainingSession.trainerComments || 'N/A'}</Typography>}
                    </CardContent>
                </Card>
            }
        </>
    )
}