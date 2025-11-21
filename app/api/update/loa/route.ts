import {deleteExpiredLoas} from "@/actions/loa";
import {revalidatePath} from "next/cache";
import {updateSyncTime} from "@/actions/lib/sync";
import {verifyUpdaterKey} from "@/lib/update";
import {NextRequest} from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {

    if (!(await verifyUpdaterKey(req))) {
        return new Response('Unauthorized', {status: 401});
    }

    await deleteExpiredLoas();

    await updateSyncTime({loas: new Date()});

    revalidatePath('/', 'layout');

    return Response.json({ok: true,});
}