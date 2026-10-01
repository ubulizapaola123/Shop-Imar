"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
      <p className="max-w-md text-muted-foreground text-sm">
        We could not load this page. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-[#15803D] hover:bg-[#166534] px-5 py-2.5 font-semibold text-white transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
