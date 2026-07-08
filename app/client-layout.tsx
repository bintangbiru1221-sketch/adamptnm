"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { useAppContext } from "@/lib/context";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, authInitialized } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authInitialized) return; // Tunggu sampai auth diinisialisasi
    
    if (!isLoggedIn && pathname !== "/login") {
      router.push("/login");
    }
    if (isLoggedIn && pathname === "/login") {
      router.push("/");
    }
  }, [isLoggedIn, pathname, router, authInitialized]);

  if (!authInitialized) {
    // Tampilkan loading atau null selama inisialisasi
    return null;
  }

  if (!isLoggedIn) {
    return pathname === "/login" ? <>{children}</> : null;
  }

  return (
    <>
      <div className="mx-auto max-w-md px-5 pb-28 pt-6">{children}</div>
      <BottomNav />
    </>
  );
}
