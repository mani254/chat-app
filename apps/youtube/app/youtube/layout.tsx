"use client";

import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { Toaster } from "@workspace/ui/components/sonner";

export default function MuxLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full">
        {children}
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}