import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";

const {UPDATER_KEY, UPDATER_ORIGIN} = process.env;

export const verifyUpdaterOrigin = async (req: Request) => {
    const origin = req.headers.get('origin');
    const apiKey = req.headers.get('x-updater-key');

    const session = await getServerSession(authOptions);
    const isWm = session?.user.staffPositions.includes('WM');

    if (isWm && origin === UPDATER_ORIGIN && apiKey === UPDATER_KEY) {
        return true;
    }

    console.log(`Updater origin verification failed. Origin: ${origin}, Expected: ${UPDATER_ORIGIN}, API Key Present: ${apiKey ? 'Yes' : 'No'}`);
    return false;
}