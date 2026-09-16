import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent p-2 sm:p-4 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between">
      <main className="w-full max-w-4xl mx-auto flex-1">{children}</main>
    </div>
  );
}
