"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Send, Mail, CreditCard } from "lucide-react";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/campaigns", label: "Campaigns", icon: Send },
  { href: "/sender-accounts", label: "Sender", icon: Mail },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-md px-4 pb-4">
      <div className="flex items-center justify-between rounded-full bg-ink px-3 py-3 shadow-soft">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                active ? "bg-canvas text-ink" : "text-canvas/60 hover:text-canvas"
              }`}
            >
              <Icon size={20} strokeWidth={2} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
