"use client";

import { Bell, X } from "lucide-react";
import { useAppContext } from "@/lib/context";
import { useState } from "react";

export default function TopHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  const { user, logout, campaigns } = useAppContext();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Dapatkan inisial user dari email
  const getUserInitials = () => {
    if (!user?.email) return "MG";
    const name = user.email.split("@")[0];
    return name.slice(0, 2).toUpperCase();
  };

  // Hitung total pengiriman campaign
  const totalSent = campaigns.reduce((sum, campaign: any) => sum + (campaign.sent || 0), 0);

  return (
    <header className="flex items-center justify-between pb-6 pt-2">
      <div className="flex items-center gap-4">
        <img
          src="/logo.jpg"
          alt="Logo"
          className="h-12 w-12 object-contain"
        />
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink" style={{ fontFamily: 'RoadRage' }}>{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-soft"
        >
          <Bell size={18} className="text-ink" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ink" />
        </button>
        <button
          onClick={() => setShowProfileModal(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-semibold text-canvas"
        >
          {getUserInitials()}
        </button>
      </div>

      {/* Profile Pop Up */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-ink rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">{getUserInitials()}</span>
              </div>
              
              <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Nama</p>
                  <p className="text-lg font-semibold text-ink">{user?.email ? user.email.split('@')[0] : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">ID</p>
                  <p className="text-sm font-medium text-ink">{user?.id || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Gmail</p>
                  <p className="text-sm font-medium text-ink">{user?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Total Pengiriman Campaign</p>
                  <p className="text-lg font-semibold text-ink">{totalSent}</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-red-500 hover:bg-red-600 text-white py-3 text-sm font-semibold transition-colors"
              >
                <img 
                  src="/How_to_Secure_a_Door_From_the_Inside_-_Best_Door_Barricades-removebg-preview.png" 
                  alt="Logout" 
                  className="w-7 h-7 object-contain"
                />
                Keluar dari Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm relative p-6">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <div className="text-center">
              <div className="flex items-center justify-center mx-auto mb-4">
                <img 
                  src="/How_to_Secure_a_Door_From_the_Inside_-_Best_Door_Barricades-removebg-preview.png" 
                  alt="Logout" 
                  className="w-24 h-24 object-contain"
                />
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">Keluar dari Akun?</h3>
              <p className="text-sm text-muted mb-6">Anda yakin ingin keluar dari akun Anda?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 px-4 rounded-full bg-gray-100 hover:bg-gray-200 text-ink font-semibold text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    setShowLogoutConfirm(false);
                  }}
                  className="flex-1 py-2 px-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold text-sm"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
