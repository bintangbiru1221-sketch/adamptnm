"use client";

import TopHeader from "@/components/TopHeader";
import { plans } from "@/lib/data";
import { useAppContext } from "@/lib/context";
import { Check } from "lucide-react";

export default function BillingPage() {
  const { subscription } = useAppContext();
  return (
    <main>
      <TopHeader eyebrow="Subscription" title="Billing" />

      {/* Current Plan dengan foto di belakang */}
      <section className="rounded-xl2 bg-ink p-5 text-canvas shadow-soft relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src={subscription.image}
            alt="Current Plan"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-canvas/60">Current Plan</p>
          <h2 className="mt-1 font-display text-3xl font-bold">{subscription.plan}</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-canvas/60">Expired Date</p>
              <p className="font-semibold">{subscription.expiredAt}</p>
            </div>
            <div>
              <p className="text-canvas/60">Gmail Limit</p>
              <p className="font-semibold">{subscription.gmailLimit} akun</p>
            </div>
            <div>
              <p className="text-canvas/60">Contact Limit</p>
              <p className="font-semibold">{subscription.contactLimit.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pilih Paket dengan foto di setiap card */}
      <section className="mt-7">
        <h2 className="font-display text-lg font-bold">Pilih Paket</h2>
        <div className="mt-3 space-y-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl2 p-4 shadow-soft relative overflow-hidden ${
                p.name === subscription.plan ? "bg-ink text-canvas" : "bg-card text-ink"
              }`}
            >
              {/* Foto di belakang card paket */}
              <div className="absolute inset-0 opacity-20">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Konten card dengan z-10 */}
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold">{p.name}</h3>
                  <span className="text-sm font-semibold">{p.price}</span>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {[p.gmail, p.contacts, p.extra].map((line) => (
                    <li key={line} className="flex items-center gap-2">
                      <Check size={14} className={p.name === subscription.plan ? "text-canvas" : "text-ink"} />
                      {line}
                    </li>
                  ))}
                </ul>
                {p.name !== subscription.plan && (
                  <button className="mt-4 w-full rounded-full bg-ink py-2 text-xs font-semibold text-canvas">
                    Upgrade ke {p.name}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
