import React, {Suspense} from 'react';
import EventStatisticsInformation from "@/components/EventStatistics/EventStatisticsInformation";
import {CircularProgress} from "@mui/material";

export default async function Page(props: { params: Promise<{ cid: string, }>, }) {
    const params = await props.params;

    const {cid} = params;

    return (
        <Suspense fallback={<CircularProgress/>}>
            <EventStatisticsInformation cid={cid}/>
        </Suspense>
    );
}