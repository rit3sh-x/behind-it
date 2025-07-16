'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

function makeClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { staleTime: 60_000 },
        },
    });
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => makeClient());
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}