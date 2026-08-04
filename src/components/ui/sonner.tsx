"use client";

import { Toaster as Sonner } from "sonner";

type ToastProps = Parameters<typeof Sonner>[0];

export function Toaster(props: ToastProps) {
  return (
    <Sonner
      position="top-right"
      richColors
      expand
      {...props}
      className="toaster"
      toastOptions={{
        style: {
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          color: "hsl(var(--foreground))",
        },
      }}
    />
  );
}
