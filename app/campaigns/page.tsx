"use client";

import { useState, useEffect } from "react";
import TopHeader from "@/components/TopHeader";
import StatusPill from "@/components/StatusPill";
import { useAppContext } from "@/lib/context";
import { Plus, Play, Pause, CheckCircle, Edit, Eye, X, RefreshCcw, Terminal, Clock, AlertCircle, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";

export default function CampaignsPage() {
  const { 
    campaigns, 
    updateCampaignStatus, 
    startCampaign, 
    senderAccounts,
    updateCampaign,
    getCampaignLogs,
    getProcessLogs
  } = useAppContext();

  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [viewingLogs, setViewingLogs] = useState<any>(null);
  const [viewingProcess, setViewingProcess] = useState<any>(null);
  const [campaignLogs, setCampaignLogs] = useState<any[]>([]);
  const [processLogs, setProcessLogs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    batch_size: 10,
    interval: 60,
    sender_account_ids: [] as string[],
  });

  // Poll process logs every 1 second if viewing process
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (viewingProcess) {
      interval = setInterval(() => {
        setProcessLogs(getProcessLogs(viewingProcess.id));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewingProcess, getProcessLogs]);

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

  const handleEdit = (campaign: any) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name || "",
      subject: campaign.subject || "",
      body: campaign.body || "",
      batch_size: campaign.batch_size || 10,
      interval: campaign.interval || 60,
      sender_account_ids: campaign.sender_account_ids || [],
    });
  };

  const handleSaveEdit = async () => {
    if (editingCampaign) {
      await updateCampaign(editingCampaign.id, formData);
      setEditingCampaign(null);
    }
  };

  const handleViewLogs = async (campaign: any) => {
    setViewingLogs(campaign);
    const logs = await getCampaignLogs(campaign.id);
    setCampaignLogs(logs);
  };

  const handleViewProcess = (campaign: any) => {
    setViewingProcess(campaign);
    setProcessLogs(getProcessLogs(campaign.id));
  };

  const toggleSenderAccount = (id: string) => {
    setFormData((prev) => {
      if (prev.sender_account_ids.includes(id)) {
        return {
          ...prev,
          sender_account_ids: prev.sender_account_ids.filter((i) => i !== id),
        };
      } else {
        return {
          ...prev,
          sender_account_ids: [...prev.sender_account_ids, id],
        };
      }
    });
  };

  const getProcessLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'wait':
        return <Clock size={16} className="text-yellow-600" />;
      default:
        return <Info size={16} className="text-blue-600" />;
    }
  };

  const getProcessLogBg = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'wait':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
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
                  {getSenderEmails(c.sender_account_ids || [])} | Batch {c.batch_size} | Interval {c.interval}s
                </p>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sand">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${percent}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted">
                  <span>
                    {c.sent} / {c.total_contacts} Sent | {c.failed} Failed
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
                  <button
                    onClick={() => handleViewProcess(c)}
                    className="flex items-center justify-center gap-1 rounded-full bg-sand px-3 py-2 text-xs font-semibold text-ink"
                  >
                    <Terminal size={14} /> Cek Proses
                  </button>
                  <button
                    onClick={() => handleViewLogs(c)}
                    className="flex items-center justify-center gap-1 rounded-full bg-sand px-3 py-2 text-xs font-semibold text-ink"
                  >
                    <Eye size={14} /> Riwayat
                  </button>
                  <button
                    onClick={() => handleEdit(c)}
                    className="flex items-center justify-center gap-1 rounded-full bg-sand px-3 py-2 text-xs font-semibold text-ink"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  {c.status !== "Completed" && (
                    <button
                      onClick={() => handleComplete(c.id)}
                      className="flex items-center justify-center gap-1 rounded-full bg-sand px-3 py-2 text-xs font-semibold text-ink"
                    >
                      <CheckCircle size={14} />
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

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl2 p-6 w-full max-w-md shadow-soft max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-ink">Edit Campaign</h3>
              <button
                onClick={() => setEditingCampaign(null)}
                className="p-2 rounded-full hover:bg-sand"
              >
                <X size={18} className="text-ink" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">
                  Nama Campaign
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-line p-3 text-sm text-ink bg-canvas"
                  placeholder="Nama Campaign"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1">
                  Subjek Email
                </label>
                <input
                  required
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-lg border border-line p-3 text-sm text-ink bg-canvas"
                  placeholder="Subjek Email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1">
                  Isi Email
                </label>
                <textarea
                  required
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full rounded-lg border border-line p-3 text-sm text-ink bg-canvas"
                  placeholder="Isi Email"
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1">
                  Pilih Akun Sender (Rotasi)
                </label>
                <div className="space-y-2">
                  {senderAccounts.map((acc: any) => (
                    <label
                      key={acc.id}
                      className="flex items-center gap-3 rounded-xl2 bg-card p-3 shadow-soft cursor-pointer border border-line"
                    >
                      <input
                        type="checkbox"
                        checked={formData.sender_account_ids.includes(acc.id)}
                        onChange={() => toggleSenderAccount(acc.id)}
                        className="w-4 h-4 text-ink"
                      />
                      <span className="text-ink">{acc.email}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">
                    Jumlah per Batch
                  </label>
                  <input
                    type="number"
                    value={formData.batch_size}
                    onChange={(e) =>
                      setFormData({ ...formData, batch_size: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-line p-3 text-sm text-ink bg-canvas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1">
                    Interval (detik)
                  </label>
                  <input
                    type="number"
                    value={formData.interval}
                    onChange={(e) =>
                      setFormData({ ...formData, interval: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-line p-3 text-sm text-ink bg-canvas"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveEdit}
                className="w-full flex items-center justify-center gap-2 rounded-xl2 bg-ink py-3 text-sm font-semibold text-canvas shadow-soft"
              >
                <RefreshCcw size={16} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Logs Modal */}
      {viewingLogs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl2 p-6 w-full max-w-md shadow-soft max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-ink">Riwayat Pengiriman</h3>
              <button
                onClick={() => setViewingLogs(null)}
                className="p-2 rounded-full hover:bg-sand"
              >
                <X size={18} className="text-ink" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-ink">{viewingLogs.name}</h4>
              <p className="text-xs text-muted mt-1">
                {viewingLogs.sent} / {viewingLogs.total_contacts} Sent | {viewingLogs.failed} Failed
              </p>
            </div>

            <div className="space-y-2">
              {campaignLogs.length > 0 ? (
                campaignLogs.map((log: any, index: number) => (
                  <div
                    key={index}
                    className={`rounded-lg p-3 border ${
                      log.status === "Success"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{log.recipient_email}</span>
                      <span
                        className={`text-xs font-semibold ${
                          log.status === "Success" ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Dari: {log.sender_accounts?.email || "Unknown"}
                    </p>
                    {log.error_message && (
                      <p className="text-xs text-red-600 mt-1">{log.error_message}</p>
                    )}
                    <p className="text-xs text-muted mt-1">
                      {new Date(log.sent_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted text-sm">
                  Belum ada log pengiriman
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Process Modal */}
      {viewingProcess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl2 p-6 w-full max-w-lg shadow-soft max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal size={20} className="text-ink" />
                <h3 className="font-display text-lg font-bold text-ink">Proses Berlangsung</h3>
              </div>
              <button
                onClick={() => setViewingProcess(null)}
                className="p-2 rounded-full hover:bg-sand"
              >
                <X size={18} className="text-ink" />
              </button>
            </div>

            <div className="mb-4 pb-4 border-b border-line">
              <h4 className="font-semibold text-ink">{viewingProcess.name}</h4>
              <p className="text-xs text-muted mt-1">
                Status: <StatusPill status={viewingProcess.status} />
              </p>
              <p className="text-xs text-muted mt-1">
                {viewingProcess.sent} / {viewingProcess.total_contacts} Sent | {viewingProcess.failed} Failed
              </p>
            </div>

            <div className="bg-black rounded-lg p-4 font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
              {processLogs.length > 0 ? (
                processLogs.map((log: any, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-gray-500 shrink-0">
                      {log.timestamp.toLocaleTimeString("id-ID")}
                    </span>
                    <span className="shrink-0 mt-0.5">{getProcessLogIcon(log.type)}</span>
                    <span className={`${
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'wait' ? 'text-yellow-400' : 'text-blue-400'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-4">
                  Menunggu proses dimulai...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
