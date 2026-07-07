"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TopHeader from "@/components/TopHeader";
import StatusPill from "@/components/StatusPill";
import { useAppContext } from "@/lib/context";
import { Plus, RefreshCcw, Trash2, X, CheckCircle, AlertCircle } from "lucide-react";

export default function SenderAccountsPage() {
  const { senderAccounts, deleteSenderAccount, reconnectSenderAccount, fetchSenderAccounts } = useAppContext();
  const searchParams = useSearchParams();
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    
    if (error) {
      setNotification({ type: 'error', message: decodeURIComponent(error) });
    } else if (success) {
      setNotification({ type: 'success', message: decodeURIComponent(success) });
      fetchSenderAccounts();
    }

    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [searchParams, fetchSenderAccounts]);

  const handleConnectGmail = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <main>
      <TopHeader eyebrow="Connect" title="Sender Accounts" />

      {/* Notifikasi */}
      {notification && (
        <div className={`mb-4 rounded-xl2 p-4 flex items-center gap-2 shadow-soft ${
          notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      <button
        onClick={handleConnectGmail}
        className="flex w-full items-center justify-center gap-2 rounded-xl2 bg-ink py-3 text-sm font-semibold text-canvas shadow-soft"
      >
        <Plus size={16} /> Hubungkan Akun Gmail
      </button>

      <div className="mt-5 space-y-3">
        {senderAccounts.length > 0 ? (
          senderAccounts.map((acc: any) => {
            const percent = Math.round((acc.quota_used / acc.quota_limit) * 100);
            const isConnected = !!acc.access_token;
            return (
              <div key={acc.id} className="rounded-xl2 bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sand text-sm font-semibold text-ink">
                      G
                    </div>
                    <div>
                      <p className="font-semibold text-ink">{acc.email}</p>
                      <p className="text-xs text-muted">
                        {isConnected ? 'Terhubung ke Gmail API' : 'Tidak terhubung'}
                      </p>
                    </div>
                  </div>
                  <StatusPill status={isConnected ? 'Connected' : 'Disconnected'} />
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sand">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted">
                  {acc.quota_used} / {acc.quota_limit} email terkirim hari ini
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleConnectGmail}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-sand py-2 text-xs font-semibold text-ink"
                  >
                    <RefreshCcw size={13} /> Reconnect
                  </button>
                  <button
                    onClick={() => deleteSenderAccount(acc.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-sand py-2 text-xs font-semibold text-ink"
                  >
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl2 bg-card p-8 text-center shadow-soft">
            <p className="text-muted text-sm">Belum ada akun Gmail yang terhubung</p>
            <p className="text-xs text-muted mt-1">Klik tombol di atas untuk menambahkan akun Gmail</p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl2 border border-line bg-card p-4 text-xs text-muted">
        Token OAuth disimpan secara aman. Multi Gmail Wetan tidak pernah menyimpan password Gmail Anda.
      </div>
    </main>
  );
}
