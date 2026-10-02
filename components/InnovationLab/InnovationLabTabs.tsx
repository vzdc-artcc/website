'use client';
import React from 'react';
import {InnovationLabProject} from "@/generated/prisma/browser";
import {Box, Tab, Tabs} from "@mui/material";
import Markdown from "react-markdown";

export default function InnovationLabTabs({projects, alias}: { projects: InnovationLabProject[], alias?: string, }) {

    const [currentAlias, setCurrentAlias] = React.useState(alias || projects[0]?.alias || '');

    const handleChange = (_: React.SyntheticEvent, newValue: string) => {
        setCurrentAlias(newValue);
    }

    return (
        <Box>
            <Tabs variant="scrollable" scrollButtons="auto" value={currentAlias} onChange={handleChange}
                  textColor="inherit">
                {projects.map((project) => (
                    <Tab value={project.alias} label={project.name}/>))}
            </Tabs>
            <Box>
                {projects.map((project) => (
                    <Box key={project.id} hidden={currentAlias !== project.alias}>
                        {currentAlias === project.alias && (
                            <Box>
                                <h2>{project.name}</h2>
                                <Markdown>{project.description}</Markdown>
                            </Box>
                        )}
                    </Box>
                ))}
            </Box>
        </Box>

    );
}