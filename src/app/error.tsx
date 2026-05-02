"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertTriangle className="size-10 text-muted-foreground" />
      <h1 className="font-semibold text-xl">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground text-sm">
        An unexpected error occurred. You can try again, or reload the page if it keeps
        happening.
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre className="max-w-2xl overflow-auto rounded-md border bg-muted p-3 text-left text-xs">
          {error.message}
          {error.digest ? `\n\nDigest: ${error.digest}` : ""}
        </pre>
      )}
      <Button onClick={() => reset()}>
        <RotateCw className="mr-2 size-4" />
        Try again
      </Button>
    </div>
  );
}
