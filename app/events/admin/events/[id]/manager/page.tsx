import {authOptions} from "@/auth/auth";
import ArchivedAlert from "@/components/EventManager/ArchivedAlert";
import EventControls from "@/components/EventManager/EventControls";
import EventPositionsTable from "@/components/EventManager/EventPositionsTable";
import EventPresetSelector from "@/components/EventManager/EventPresetSelector";
import HiddenAlert from "@/components/EventManager/HiddenAlert";
import EventPositionRequestForm from "@/components/EventPosition/EventPositionRequestForm";
import prisma from "@/lib/db";
import {ExpandMore} from "@mui/icons-material";
import {Accordion, AccordionDetails, AccordionSummary, Box, Paper, Stack, Typography} from "@mui/material";
import {EventPosition, SoloCertification, User} from "@prisma/client";
import {getServerSession} from "next-auth";
import {notFound} from "next/navigation";
import OpsPlanForm from "@/components/EventManager/OpsPlanForm";
import TmiForm from "@/components/EventManager/TmiForm";
import OpsPlanFreeTextForm from "@/components/EventManager/OpsPlanFreeTextForm";
import OpsPlanView from "@/components/OpsPlan/OpsPlanView";
import OpsPlanFileForm from "@/components/EventManager/OpsPlanFileForm";

export type EventPositionWithSolo = EventPosition & { 
    soloCert: SoloCertification | null | undefined,
    user: User | null | undefined,
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params;

    const event = await prisma.event.findUnique({
        where: {
            id,
        },
        include: {
            positions: {
                include: {
                    user: true,
                },
                orderBy: {
                    submittedAt: 'asc',
                }
            },
        },
    });

    if (!event) {
        notFound();
    }

    const session = await getServerSession(authOptions);

    const positions: EventPositionWithSolo[] = (await Promise.all(event.positions.map(async (position) => {
        if (!position.user) {
            return { ...position, soloCert: undefined, user: undefined };
        }
        const soloCert = await getSoloCertification(position.user);
        return { ...position, soloCert };
    }))).sort((a, b) => (a.user?.lastName || '').localeCompare(b.user?.lastName || ''));

    return session?.user && (
        <Stack spacing={2}>
            { event.archived && <ArchivedAlert /> }
            { event.hidden && !event.archived && <HiddenAlert /> }
            <EventControls event={event} />

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" gutterBottom>Preset Positions</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <EventPresetSelector event={event} />
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" gutterBottom>OPS Plan</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <OpsPlanForm event={event} admin currentUser={session.user as User} />
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" gutterBottom>TMIs</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <TmiForm event={event} admin currentUser={session.user as User} />
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" gutterBottom>OPS Plan Free Text</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <OpsPlanFreeTextForm event={event} admin currentUser={session.user as User} />
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" gutterBottom>OPS Plan Files</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <OpsPlanFileForm eventId={event.id} />
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" gutterBottom>Manually Assign Controller</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <EventPositionRequestForm event={event} admin currentUser={session.user as User} />
                </AccordionDetails>
            </Accordion>

            <EventPositionsTable event={event} positions={positions} />

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" gutterBottom>OPS Plan Preview</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Paper elevation={2} sx={{ p: 4 }}>
                        <OpsPlanView eventId={event.id}/>
                    </Paper>
                </AccordionDetails>
            </Accordion>
        </Stack>
    );
}

const getSoloCertification = async (user: User) => {
    return prisma.soloCertification.findFirst({
        where: {
            userId: user.id,
        },
    });
}