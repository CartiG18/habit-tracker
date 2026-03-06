"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import BottomNav from "@/components/layout/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-4xl animate-pulse">🧠</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 gradient-mesh">
      <main className="pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
