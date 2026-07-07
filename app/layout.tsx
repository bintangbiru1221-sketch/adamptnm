import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import ClientLayout from "./client-layout";

// Metadata di server component
export const metadata: Metadata = {
  title: "Multi Gmail Wetan",
  description: "Kirim email broadcast bertahap menggunakan Gmail Anda sendiri.",
};

// Root layout sebagai server component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-body bg-canvas text-ink">
        <AppProvider>
          <ClientLayout>{children}</ClientLayout>
        </AppProvider>
      </body>
    </html>
  );
}
