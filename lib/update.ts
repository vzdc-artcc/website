import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {NextRequest} from "next/server";

const {UPDATER_KEY} = process.env;

export const verifyUpdaterKey = async (req: NextRequest) => {
    const apiKey = req.headers.get('API-Key');

    const session = await getServerSession(authOptions);
    const isWm = session?.user.staffPositions.includes('WM');

    if (isWm || apiKey === UPDATER_KEY) {
        return true;
    }

    console.log(`Updater origin verification failed. Expected: API Key Present: ${apiKey ? 'Yes' : 'No'}`);
    return false;
}
