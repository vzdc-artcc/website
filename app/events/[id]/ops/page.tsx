import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { Box, Paper, Typography } from "@mui/material";
import OpsPlanView from "@/components/OpsPlan/OpsPlanView";
import OpsPlanFiles from "@/components/OpsPlan/OpsPlanFiles";

type Params = { params: Promise<{ id: string }> };

export default async function Page({ params }: Params) {
    const { id } = await params;

    const event = await prisma.event.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            host: true,
            start: true,
            end: true,
            opsPlanPublished: true,
            opsFreeText: true,
            featuredFields: true,
            featuredFieldConfigs: true,
            hidden: true,
            archived: true,
        },
    });

    if (!event) return notFound();
    if (event.hidden || event.archived) return notFound();

    if (event.opsPlanPublished) {
        return (
            <Box sx={{ px: 2, py: 3 }}>
                <Paper elevation={2} sx={{ p: 4 }}>
                    <OpsPlanView eventId={event.id} />
                    <Box sx={{ mt: 3 }}>
                        <OpsPlanFiles eventId={event.id} />
                    </Box>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ px: 2, py: 6, display: "flex", justifyContent: "center" }}>
            <Paper
                elevation={1}
                sx={{
                    maxWidth: 900,
                    width: "100%",
                    p: 4,
                }}
            >
                <Typography variant="h5" gutterBottom>
                    OPS Plan Not Published
                </Typography>

                <Typography variant="body1" sx={{ mt: 1 }}>
                    The OPS Plan for <strong>{event.name}</strong> has not been published yet.
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Event staff are still preparing the OPS Plan. Once the OPS Plan is published it will be available
                    here for you to view. If you believe this is an error or you need access sooner, please contact
                    the event organizers.
                </Typography>
            </Paper>
        </Box>
    );
}
