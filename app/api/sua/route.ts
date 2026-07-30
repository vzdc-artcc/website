import {osmium} from "@/lib/osmium/client";

export async function GET() {

    const {data, error} = await osmium.GET("/api/v1/sua/upcoming", {});

    if (error) {
        return Response.json({error: "Failed to fetch upcoming SUA missions."}, {status: 502});
    }

    const suas = data.items.map((mission) => ({
        id: mission.id,
        start: mission.start_at,
        end: mission.end_at,
        afiliation: mission.afiliation,
        details: mission.details,
        missionNumber: mission.mission_number,
        createdAt: mission.created_at,
        updatedAt: mission.updated_at,
        airspace: mission.airspace.map((a) => ({
            id: a.id,
            suaBlockId: a.sua_block_id,
            identifier: a.identifier,
            bottomAltitude: a.bottom_altitude,
            topAltitude: a.top_altitude,
        })),
        user: {
            cid: mission.cid,
        },
    }));

    return Response.json(suas);
}
