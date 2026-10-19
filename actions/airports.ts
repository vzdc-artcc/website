'use server';

import prisma from "@/lib/db";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";
import {z} from "zod";

export const upsertInstruction = async (formData: FormData) => {

    const runwayZ = z.object({
        id: z.string().optional(),
        runwayId: z.string(),
        route: z.string().min(1, "Route is required"),
        procedure: z.string().min(1, "Procedure is required"),
    });

    const result = runwayZ.safeParse({
        id: formData.get('id') as string,
        runwayId: formData.get('runwayId') as string,
        route: formData.get('route') as string,
        procedure: formData.get('procedure') as string,
    });

    if (!result.success) {
        return {errors: result.error.issues};
    }

    const instruction = await prisma.runwayInstruction.upsert({
        create: {
            route: result.data.route,
            procedure: result.data.procedure,
            runwayId: result.data.runwayId,
        },
        update: {
            route: result.data.route,
            procedure: result.data.procedure,
        },
        where: {
            id: result.data.id || '',
        },
        include: {
            runway: {
                include: {
                    airport: true,
                },
            },
        },
    });
    await log(result.data.id ? "UPDATE" : "CREATE", "AIRPORT_PROCEDURE", `Saved procedure '${instruction.route}' for runway ${instruction.runway.name} at ${instruction.runway.airport.icao}`);
    revalidatePath(`/admin/airports/airport/${instruction.runway.airport.id}/${instruction.runway.id}`);
    return {instruction};
}
export const upsertRunway = async (formData: FormData) => {

    const runwayZ = z.object({
        id: z.string().optional(),
        airportId: z.string(),
        name: z.string().min(1, "Name is required"),
    });

    const result = runwayZ.safeParse({
        id: formData.get('id') as string,
        airportId: formData.get('airportId') as string,
        name: formData.get('name') as string,
    });

    if (!result.success) {
        return {errors: result.error.issues};
    }

    const runway = await prisma.runway.upsert({
        create: {
            name: result.data.name,
            airportId: result.data.airportId,
        },
        update: {
            name: result.data.name,
        },
        where: {
            id: result.data.id || '',
        },
        include: {
            airport: true,
        },
    });
    await log(result.data.id ? "UPDATE" : "CREATE", "AIRPORT_RUNWAY", `Saved runway ${runway.name} at ${runway.airport.icao}`);
    revalidatePath(`/admin/airports/airport/${result.data.airportId}`);
    revalidatePath(`/airports/${result.data.airportId}`);
    return {runway};
}
export const upsertAirport = async (formData: FormData) => {

    const airportZ = z.object({
        id: z.string().optional(),
        traconGroupId: z.string(),
        icao: z.string().length(4, "ICAO must be 4 characters"),
        iata: z.string().length(3, "IATA must be 3 characters"),
        name: z.string().min(1, "Name must not be empty"),
        city: z.string().min(1, "City must not be empty"),
    });

    const result = airportZ.safeParse({
        id: formData.get("id") as string,
        traconGroupId: formData.get("traconGroupId") as string,
        icao: formData.get("icao") as string,
        iata: formData.get("iata") as string,
        name: formData.get("name") as string,
        city: formData.get("city") as string,
    });

    if (!result.success) {
        return {errors: result.error.issues};
    }

    const airport = await prisma.airport.upsert({
        create: {
            icao: result.data.icao,
            iata: result.data.iata,
            name: result.data.name,
            city: result.data.city,
            traconGroupId: result.data.traconGroupId,
        },
        update: {
            icao: result.data.icao,
            iata: result.data.iata,
            name: result.data.name,
            city: result.data.city,
        },
        where: {
            id: result.data.id || '',
        },
    });
    await log(result.data.id ? "UPDATE" : "CREATE", "AIRPORT", `Saved airport ${airport.icao} (${airport.name})`);
    revalidatePath("/admin/airports");
    revalidatePath("/airports");
    revalidatePath(`/airports/${airport.id}`);
    revalidatePath(`/admin/airports/airport/${airport.id}`);
    return {airport};
}

export const upsertTraconGroup = async (formData: FormData) => {
    const traconGroupZ = z.object({
        id: z.string().optional(),
        name: z.string().min(1, "Name must not be empty"),
    });

    const result = traconGroupZ.safeParse({
        id: formData.get("id") as string,
        name: formData.get("name") as string,
    });

    if (!result.success) {
        return {errors: result.error.issues};
    }

    const traconGroup = await prisma.traconGroup.upsert({
        create: {
            name: result.data.name,
        },
        update: {
            name: result.data.name,
        },
        where: {
            id: result.data.id || '',
        },
    });
    await log(result.data.id ? "UPDATE" : "CREATE", "AIRPORT_TRACON_GROUP", `Saved TRACON group ${traconGroup.name}`);
    revalidatePath("/admin/airports");
    revalidatePath("/airports");
    return {traconGroup};
}

export const deleteTraconGroup = async (traconGroupId: string) => {
    const traconGroup = await prisma.traconGroup.delete({
        where: {
            id: traconGroupId,
        },
    });
    await log("DELETE", "AIRPORT_TRACON_GROUP", `Deleted TRACON group ${traconGroup.name}`);
    revalidatePath("/admin/airports");
    revalidatePath("/airports");
    return traconGroup;
}
export const deleteAirport = async (icao: string) => {
    const airport = await prisma.airport.delete({
        where: {
            icao,
        }
    });
    await log("DELETE", "AIRPORT", `Deleted airport ${airport.icao} (${airport.name})`);
    revalidatePath("/admin/airports");
    revalidatePath("/airports");
    revalidatePath(`/airports/${airport.id}`);
    return airport;
}

export const deleteRunway = async (runwayId: string) => {
    const runway = await prisma.runway.delete({
        where: {
            id: runwayId,
        },
        include: {
            airport: true,
        },
    });
    await log("DELETE", "AIRPORT_RUNWAY", `Deleted runway ${runway.name} at ${runway.airport.icao}`);
    revalidatePath("/admin/airports");
    revalidatePath("/airports");
    revalidatePath(`/admin/airports/airport/${runway.airport.id}`);
    revalidatePath(`/airports/${runway.airport.id}`);
    return runway;
}

export const deleteProcedure = async (procedureId: string) => {
    const procedure = await prisma.runwayInstruction.delete({
        where: {
            id: procedureId,
        },
        include: {
            runway: {
                include: {
                    airport: true,
                },
            },
        },
    });
    await log("DELETE", "AIRPORT_PROCEDURE", `Deleted procedure ${procedure.route} for runway ${procedure.runway.name} at ${procedure.runway.airport.icao}`);
    revalidatePath(`/admin/airports/airport/${procedure.runway.airport.id}/${procedure.runway.id}`);
    return procedure;
}