import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";

const {UPDATER_KEY} = process.env;

export const verifyUpdaterKey = async (req: Request) => {
    const apiKey = req.headers.get('x-updater-key');
    // print all headers
    console.log('Request Headers:');
    req.headers.forEach((value, key) => {
        console.log(`${key}: ${value}`);
    });
    console.log(`Received Updater Key: ${apiKey}`);
    console.log(UPDATER_KEY);

    const session = await getServerSession(authOptions);
    const isWm = session?.user.staffPositions.includes('WM');

    if (isWm || apiKey === UPDATER_KEY) {
        return true;
    }

    console.log(`Updater origin verification failed. Expected: API Key Present: ${apiKey ? 'Yes' : 'No'}`);
    return false;
}
