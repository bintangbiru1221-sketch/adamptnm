"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopHeader from "@/components/TopHeader";
import StatusPill from "@/components/StatusPill";
import { useAppContext } from "@/lib/context";
import { Users, Send, Mail, Activity, ArrowUpRight, LogOut, X } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { campaigns, dashboardStats, subscription, logout, isLoggedIn, senderAccounts } = useAppContext();
  const running = campaigns.find((c: any) => c.status === "Running");
  const recent = campaigns.slice(0, 3);
  const [showAllCampaignsModal, setShowAllCampaignsModal] = useState(false);

  const getSenderEmails = (senderAccountIds: string[]) => {
    return senderAccountIds
      .map((id) => senderAccounts.find((acc: any) => acc.id === id)?.email || "Unknown")
      .join(", ");
  };
  
  // Redirect ke login jika tidak logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  return (
    <main>
      <TopHeader eyebrow="Dashboard" title="Halo, Reza" />

      <section className="grid grid-cols-2 gap-3">
        <StatCard icon={Users} label="Total Kontak" value={dashboardStats.totalContacts.toLocaleString("id-ID")} image="/contacts.jpg" />
        <StatCard icon={Send} label="Total Campaign" value={String(dashboardStats.totalCampaigns)} image="/campaigns.jpg" />
        <StatCard icon={Mail} label="Gmail Connected" value={String(dashboardStats.gmailConnected)} image="/gmail.jpg" />
        <StatCard icon={Activity} label="Campaign Aktif" value={String(dashboardStats.activeCampaigns)} image="/activity.jpg" />
      </section>

      {running && (
        <section className="mt-6 rounded-xl2 bg-ink p-5 text-canvas shadow-soft relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img
              src="/campaign-progress.jpg"
              alt="Campaign Progress"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-canvas/60">Campaign Progress</p>
              <StatusPill status={running.status} />
            </div>
            <h3 className="mt-2 font-display text-xl font-bold">{running.name}</h3>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-canvas/15">
              <div
                className="h-full rounded-full bg-canvas"
                style={{ width: `${(running as any).total_contacts > 0 ? Math.round(((running as any).sent / (running as any).total_contacts) * 100) : 0}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-canvas/70">
              <span>
                {(running as any).sent} / {(running as any).total_contacts} Sent
              </span>
              <span>{(running as any).total_contacts > 0 ? Math.round(((running as any).sent / (running as any).total_contacts) * 100) : 0}%</span>
            </div>
          </div>
        </section>
      )}

      <section className="mt-7">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Recent Activity</h2>
          <button
            onClick={() => setShowAllCampaignsModal(true)}
            className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-ink transition-colors"
          >
            Lihat semua <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {recent.length > 0 ? (
            recent.map((c: any) => (
              <div key={c.id} className="flex items-center gap-4 rounded-xl2 bg-card p-4 shadow-soft">
                <img
                  src={c.image || "/campaigns.jpg"}
                  alt={c.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-ink">{c.name}</p>
                  <p className="text-xs text-muted">{getSenderEmails(c.sender_account_ids || [])}</p>
                </div>
                <StatusPill status={c.status} />
              </div>
            ))
          ) : (
            <div className="rounded-xl2 bg-card p-8 text-center shadow-soft">
              <p className="text-muted text-sm">Belum ada campaign</p>
              <p className="text-xs text-muted mt-1">Buat campaign pertamamu di halaman Campaigns</p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-7 rounded-xl2 border border-line bg-card p-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src={subscription.image}
            alt="Subscription"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Subscription Status</p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold">{subscription.plan}</h3>
              <p className="text-xs text-muted">Berlaku sampai {subscription.expiredAt}</p>
            </div>
            <a href="/billing" className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-canvas">
              Kelola
            </a>
          </div>
        </div>
      </section>

      {/* Tombol Logout di bawah Subscription Status */}
      <button
        onClick={logout}
        className="mt-4 w-full flex items-center justify-center gap-2 rounded-full bg-card border border-line py-3 text-sm font-semibold text-muted hover:bg-sand transition-colors"
      >
        <LogOut size={18} />
        Keluar dari Akun
      </button>

      {/* Modal Lihat Semua Campaign */}
      {showAllCampaignsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl2 p-6 w-full max-w-md shadow-soft max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-ink">Semua Campaign</h3>
              <button
                onClick={() => setShowAllCampaignsModal(false)}
                className="p-2 rounded-full hover:bg-sand"
              >
                <X size={18} className="text-ink" />
              </button>
            </div>
            <div className="space-y-3">
              {campaigns.length > 0 ? (
                campaigns.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-4 rounded-xl2 p-4 shadow-soft bg-card border border-line">
                    <img
                      src={c.image || "/campaigns.jpg"}
                      alt={c.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-ink">{c.name}</p>
                      <p className="text-xs text-muted">{getSenderEmails(c.sender_account_ids || [])}</p>
                    </div>
                    <StatusPill status={c.status} />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted text-sm">Belum ada campaign</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  image,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  image: string;
}) {
  return (
    <div className="rounded-xl2 bg-card p-4 shadow-soft flex items-center justify-between">
      <div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sand">
          <Icon size={16} className="text-ink" />
        </div>
        <p className="mt-3 text-xs text-muted">{label}</p>
        <p className="font-display text-2xl font-bold tracking-tight">{value}</p>
      </div>
      <img
        src={image}
        alt={label}
        className="h-16 w-16 object-cover"
      />
    </div>
  );
}
