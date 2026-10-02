'use client';
import React from 'react';
import {InnovationLabProject} from "@/generated/prisma/browser";
import {Box, Tab, Tabs, Typography} from "@mui/material";
import Markdown from "react-markdown";
import {formatZuluDate} from "@/lib/date";

export default function InnovationLabTabs({projects, startingAlias}: {
    projects: InnovationLabProject[],
    startingAlias?: string,
}) {

    const [currentAlias, setCurrentAlias] = React.useState(startingAlias || projects[0]?.alias || '');

    const handleChange = (_: React.SyntheticEvent, newValue: string) => {
        setCurrentAlias(newValue);
    }

    return (
        <Box>
            <Tabs variant="scrollable" scrollButtons="auto" value={currentAlias} onChange={handleChange}
                  textColor="inherit">
                {projects.map((project) => (
                    <Tab key={project.id} value={project.alias} label={project.name}/>))}
            </Tabs>
            <Box>
                {projects.map((project) => (
                    <Box key={project.id} hidden={currentAlias !== project.alias} sx={{mt: 1,}}>
                        <Typography variant="h6">{project.name}</Typography>
                        <Typography variant="caption">Updated {formatZuluDate(project.updatedAt)} ●
                            Created {formatZuluDate(project.createdAt)}</Typography>
                        <Markdown>{project.description}</Markdown>
                    </Box>
                ))}
            </Box>
        </Box>

    );
}