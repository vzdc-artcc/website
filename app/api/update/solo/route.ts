import {deleteExpiredSolos} from "@/actions/solo";
import {revalidatePath} from "next/cache";
import {updateSyncTime} from "@/actions/lib/sync";
import {verifyUpdaterOrigin} from "@/lib/update";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {

    if (!(await verifyUpdaterOrigin(req))) {
        return new Response('Unauthorized', {status: 401});
    }

    await deleteExpiredSolos();

    await updateSyncTime({soloCert: new Date()});

    revalidatePath('/', 'layout');

    return Response.json({ok: true,});
}