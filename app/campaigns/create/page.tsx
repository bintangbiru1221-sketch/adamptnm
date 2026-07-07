"use client";

import { useState } from "react";
import TopHeader from "@/components/TopHeader";
import { useAppContext } from "@/lib/context";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateCampaignPage() {
  const router = useRouter();
  const { senderAccounts, addCampaign } = useAppContext();
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    batch_size: 10,
    interval: 60,
    sender_account_ids: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCampaign(formData);
    router.push("/campaigns");
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

  return (
    <main>
      <TopHeader eyebrow="Broadcast" title="Create Campaign" />

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                className="flex items-center gap-3 rounded-xl2 bg-card p-3 shadow-soft cursor-pointer"
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
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-xl2 bg-ink py-3 text-sm font-semibold text-canvas shadow-soft"
        >
          Buat Campaign
        </button>
      </form>
    </main>
  );
}
