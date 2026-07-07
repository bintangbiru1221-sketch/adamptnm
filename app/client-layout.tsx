"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { useAppContext } from "@/lib/context";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoggedIn && pathname !== "/login") {
      router.push("/login");
    }
    if (isLoggedIn && pathname === "/login") {
      router.push("/");
    }
  }, [isLoggedIn, pathname, router]);

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
