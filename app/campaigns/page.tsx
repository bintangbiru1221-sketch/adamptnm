"use client";

import TopHeader from "@/components/TopHeader";
import StatusPill from "@/components/StatusPill";
import { useAppContext } from "@/lib/context";
import { Plus, Play, Pause, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CampaignsPage() {
  const { campaigns, updateCampaignStatus, startCampaign, senderAccounts } = useAppContext();

  const handleStart = (id: string) => {
    startCampaign(id);
  };

  const handlePause = (id: string) => {
    updateCampaignStatus(id, "Paused");
  };

  const handleComplete = (id: string) => {
    updateCampaignStatus(id, "Completed");
  };

  const getSenderEmails = (senderAccountIds: string[]) => {
    return senderAccountIds
      .map((id) => senderAccounts.find((acc: any) => acc.id === id)?.email || "Unknown")
      .join(", ");
  };

  return (
    <main>
      <TopHeader eyebrow="Broadcast" title="Campaigns" />

      <Link href="/campaigns/create">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl2 bg-ink py-3 text-sm font-semibold text-canvas shadow-soft">
          <Plus size={16} /> Create Campaign
        </button>
      </Link>

      <div className="mt-5 space-y-3">
        {campaigns.length > 0 ? (
          campaigns.map((c: any) => {
            const percent = c.total_contacts > 0 ? Math.round((c.sent / c.total_contacts) * 100) : 0;
            return (
              <div key={c.id} className="rounded-xl2 bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-ink">{c.name}</h3>
                  <StatusPill status={c.status} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {getSenderEmails(c.sender_account_ids || [])} · Batch {c.batch_size} · Interval {c.interval}s
                </p>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sand">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${percent}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted">
                  <span>
                    {c.sent} / {c.total_contacts} Sent · {c.failed} Failed
                  </span>
                  <span>{percent}%</span>
                </div>
                <p className="mt-2 text-xs text-muted">Estimated completion: {c.eta}</p>

                {/* Action Buttons */}
                <div className="mt-3 flex gap-2">
                  {c.status === "Queued" && (
                    <button
                      onClick={() => handleStart(c.id)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-full bg-ink py-2 text-xs font-semibold text-canvas"
                    >
                      <Play size={14} /> Start
                    </button>
                  )}
                  {c.status === "Running" && (
                    <button
                      onClick={() => handlePause(c.id)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-full bg-ink py-2 text-xs font-semibold text-canvas"
                    >
                      <Pause size={14} /> Pause
                    </button>
                  )}
                  {c.status === "Paused" && (
                    <button
                      onClick={() => handleStart(c.id)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-full bg-ink py-2 text-xs font-semibold text-canvas"
                    >
                      <Play size={14} /> Resume
                    </button>
                  )}
                  {c.status !== "Completed" && (
                    <button
                      onClick={() => handleComplete(c.id)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-full bg-sand py-2 text-xs font-semibold text-ink"
                    >
                      <CheckCircle size={14} /> Mark Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl2 bg-card p-8 text-center shadow-soft">
            <p className="text-muted text-sm">Belum ada campaign</p>
            <p className="text-xs text-muted mt-1">Buat campaign pertamamu di atas</p>
          </div>
        )}
      </div>
    </main>
  );
}
