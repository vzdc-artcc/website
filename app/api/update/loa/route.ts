import {deleteExpiredLoas} from "@/actions/loa";
import {revalidatePath} from "next/cache";
import {updateSyncTime} from "@/actions/lib/sync";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {

    await deleteExpiredLoas();

    await updateSyncTime({loas: new Date()});

    revalidatePath('/', 'layout');

    return Response.json({ok: true,});
}