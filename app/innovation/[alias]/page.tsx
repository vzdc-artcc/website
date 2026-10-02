import {permanentRedirect} from "next/navigation";

export default async function Page({params}: { params: Promise<{ alias: string }> }) {

    const {alias} = await params;

    permanentRedirect(`/publications/innovation?startingAlias=${alias}`);
}