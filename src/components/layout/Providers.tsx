"use client";

import { Toaster } from "react-hot-toast";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
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
    </>
  );
}
