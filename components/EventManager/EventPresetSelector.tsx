import prisma from "@/lib/db";
import {Event} from "@/generated/prisma/browser";
import PresetSelectorForm from "./PresetSelectorForm";

export default async function EventPresetSelector({ event }: { event: Event, }) {

    const positionPresets = await prisma.eventPositionPreset.findMany({
        orderBy: {
            name: 'asc',
        },
    });

    return (
        <PresetSelectorForm event={event} presetPositions={positionPresets} />
    )

}