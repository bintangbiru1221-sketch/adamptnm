"use client";

import { Bell } from "lucide-react";
import { useAppContext } from "@/lib/context";

export default function TopHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  const { user } = useAppContext();

  // Dapatkan inisial user dari email
  const getUserInitials = () => {
    if (!user?.email) return "MG";
    const name = user.email.split("@")[0];
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="flex items-center justify-between pb-6 pt-2">
      <div className="flex items-center gap-4">
        <img
          src="/logo.jpg"
          alt="Logo"
          className="h-12 w-12 object-contain"
        />
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink" style={{ fontFamily: 'RoadRage' }}>{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-soft"
        >
          <Bell size={18} className="text-ink" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ink" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-semibold text-canvas">
          {getUserInitials()}
        </div>
      </div>
    </header>
  );
}
