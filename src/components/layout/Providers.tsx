"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { ReactNode, useState } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60 * 1000,
        retry: (failureCount, error: unknown) => {
          const status = (error as { response?: { status?: number } })?.response
            ?.status;
          if (status === 401 || status === 403) return false;
          return failureCount < 2;
        },
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#141518",
            color: "#edede9",
            border: "1px solid #26272d",
            borderRadius: "12px",
            fontFamily: "var(--font-geist)",
            fontSize: "13px",
          },
          success: {
            iconTheme: { primary: "#d4a017", secondary: "#080809" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#080809" },
          },
        }}
      />
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
