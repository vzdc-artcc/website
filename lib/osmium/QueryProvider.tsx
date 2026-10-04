"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function OsmiumQueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Default networkMode ('online') can pause a query's retry
                // loop indefinitely if online/offline detection ever misfires,
                // leaving it stuck in a permanent loading state instead of
                // settling into an error a component can render. 'always'
                // just tries the request regardless. retry: false so 4xx
                // responses (e.g. "not found") surface immediately rather
                // than retrying a request that will never succeed.
                networkMode: "always",
                retry: false,
                // Refetching every mounted query on each tab switch meant dozens
                // of requests on list pages for data that had not changed.
                // staleTime stays 0: several mutations rely on the
                // refetch-on-mount rather than invalidating every list they touch.
                refetchOnWindowFocus: false,
            },
            mutations: {
                networkMode: "always",
            },
        },
    }));

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
