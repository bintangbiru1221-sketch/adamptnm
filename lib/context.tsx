"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import {
  senderAccounts as initialSenderAccounts,
  contacts as initialContacts,
  campaigns as initialCampaigns,
  dashboardStats as initialDashboardStats,
  subscription as initialSubscription,
} from "./data";
import { supabase } from "./supabase";

// Types
interface SenderAccount {
  id: string;
  user_id: string;
  email: string;
  status: "Connected" | "Disconnected";
  quota_used: number;
  quota_limit: number;
  access_token?: string;
  refresh_token?: string;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: string;
  user_id: string;
  name: string;
  email: string;
  nominal?: string;
  tanggal?: string;
  created_at: string;
  updated_at: string;
}

interface Campaign {
  id: string;
  user_id: string;
  name: string;
  sender_account_ids: string[];
  subject: string;
  body: string;
  total_contacts: number;
  sent: number;
  failed: number;
  current_index: number;
  batch_size: number;
  interval: number;
  status: "Queued" | "Running" | "Paused" | "Completed";
  eta: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

type DashboardStats = typeof initialDashboardStats;
type Subscription = typeof initialSubscription;

interface AppContextType {
  isLoggedIn: boolean;
  user: { email: string; id?: string } | null;
  session: any; // Tambahkan session
  senderAccounts: any[];
  contacts: any[];
  campaigns: any[];
  dashboardStats: DashboardStats;
  subscription: Subscription;
  login: (email: string) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addCampaign: (campaign: any) => Promise<void>;
  addContact: (contact: any) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  updateCampaignStatus: (id: string, status: any) => Promise<void>;
  deleteSenderAccount: (id: string) => Promise<void>;
  reconnectSenderAccount: (id: string) => Promise<void>;
  startCampaign: (id: string) => Promise<void>;
  fetchSenderAccounts: () => Promise<void>;
}

// Create Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Component
export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string; id?: string } | null>(null);
  const [session, setSession] = useState<any>(null); // Tambahkan state session
  const [senderAccounts, setSenderAccounts] = useState<any[]>(initialSenderAccounts);
  const [contacts, setContacts] = useState<any[]>(initialContacts);
  const [campaigns, setCampaigns] = useState<any[]>(initialCampaigns);
  const [dashboardStats, setDashboardStats] = useState(initialDashboardStats);
  const [subscription, setSubscription] = useState(initialSubscription);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Fallback login (jika Supabase belum diisi, gunakan localStorage seperti semula
  const [localIsLoggedIn, setLocalIsLoggedIn] = useState(false);
  const [localUser, setLocalUser] = useState<{ email: string } | null>(null);

  // Fallback login function
  const login = (email: string) => {
    setLocalIsLoggedIn(true);
    setLocalUser({ email });
    setIsLoggedIn(true);
    setUser({ email });
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
  };

  // Login with Google function
  const loginWithGoogle = async () => {
    if (!supabase) {
      alert("Silakan isi konfigurasi Supabase di file .env.local terlebih dahulu!");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) {
      console.error("Error login with Google:", error);
    }
  };

  // Logout function
  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setUser(null);
    setLocalIsLoggedIn(false);
    setLocalUser(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
  };

  // Fetch sender accounts from Supabase
  const fetchSenderAccounts = async () => {
    if (!supabase || !user?.id) return;
    const { data } = await supabase
      .from("sender_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) {
      setSenderAccounts(data as any);
      setDashboardStats((prev) => ({
        ...prev,
        gmailConnected: data.filter((acc: any) => acc.access_token).length,
      }));
    }
  };

  // Delete sender account
  const deleteSenderAccount = async (id: string) => {
    if (supabase && user?.id) {
      await supabase.from("sender_accounts").delete().eq("id", id);
    }
    const updatedAccounts = senderAccounts.filter((acc) => acc.id !== id);
    setSenderAccounts(updatedAccounts);
    
    const connectedCount = updatedAccounts.filter((acc) => acc.status === "Connected").length;
    setDashboardStats((prev) => ({
      ...prev,
      gmailConnected: connectedCount,
    }));
  };

  // Reconnect sender account
  const reconnectSenderAccount = async (id: string) => {
    if (supabase && user?.id) {
      await supabase.from("sender_accounts").update({ status: "Connected" }).eq("id", id);
    }
    const updatedAccounts = senderAccounts.map((acc) => {
      if (acc.id === id) {
        return { ...acc, status: "Connected" };
      }
      return acc;
    });
    setSenderAccounts(updatedAccounts);
    
    const connectedCount = updatedAccounts.filter((acc) => acc.status === "Connected").length;
    setDashboardStats((prev) => ({
      ...prev,
      gmailConnected: connectedCount,
    }));
  };

  // Fetch contacts from Supabase
  const fetchContacts = async () => {
    if (!supabase || !user?.id) return;
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) {
      setContacts(data as any);
      setDashboardStats((prev) => ({
        ...prev,
        totalContacts: data.length,
      }));
    }
  };

  // Fetch campaigns from Supabase
  const fetchCampaigns = async () => {
    if (!supabase || !user?.id) return;
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) {
      setCampaigns(data as any);
      setDashboardStats((prev) => ({
        ...prev,
        totalCampaigns: data.length,
        activeCampaigns: data.filter((c: any) => c.status === "Running").length,
      }));
    }
  };

  // Check Supabase session OR localStorage on mount
  useEffect(() => {
    if (supabase) {
      // Cek session awal
      const checkSession = async () => {
        const { data: { session } } = await supabase!.auth.getSession();
        setSession(session);
        if (session?.user) {
          setIsLoggedIn(true);
          setUser({ email: session.user.email!, id: session.user.id });
          await fetchSenderAccounts();
          await fetchContacts();
          await fetchCampaigns();
        }
        setAuthInitialized(true);
      };
      checkSession();

      // Listener untuk perubahan auth state
      const { data: { subscription } } = supabase!.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session);
          if (session?.user) {
            setIsLoggedIn(true);
            setUser({ email: session.user.email!, id: session.user.id });
            await fetchSenderAccounts();
            await fetchContacts();
            await fetchCampaigns();
          } else {
            setIsLoggedIn(false);
            setUser(null);
            setSession(null);
          }
        }
      );

      return () => subscription.unsubscribe();
    } else {
      // Fallback ke localStorage jika Supabase belum diisi
      const savedIsLoggedIn = localStorage.getItem("isLoggedIn");
      const savedUserEmail = localStorage.getItem("userEmail");
      if (savedIsLoggedIn === "true" && savedUserEmail) {
        setLocalIsLoggedIn(true);
        setLocalUser({ email: savedUserEmail });
        setIsLoggedIn(true);
        setUser({ email: savedUserEmail });
      }
      setAuthInitialized(true);
    }
  }, []);

  // Add new campaign
  const addCampaign = async (campaignData: any) => {
    if (!supabase || !user?.id) {
      alert("Silakan login terlebih dahulu!");
      return;
    }
    const { error } = await supabase.from("campaigns").insert([
      { 
        user_id: user.id, 
        ...campaignData,
        total_contacts: contacts.length,
        eta: `${Math.ceil((contacts.length / campaignData.batch_size) * Number(campaignData.interval))} menit`
      }
    ]);
    if (error) {
      alert("Gagal membuat campaign: " + error.message);
    } else {
      await fetchCampaigns();
      setDashboardStats((prev) => ({
        ...prev,
        totalCampaigns: prev.totalCampaigns + 1,
      }));
    }
  };

  // Add new contact
  const addContact = async (contactData: any) => {
    if (!supabase || !user?.id) {
      alert("Silakan login terlebih dahulu!");
      return;
    }
    const { error } = await supabase.from("contacts").insert([
      { user_id: user.id, ...contactData }
    ]);
    if (error) {
      alert("Gagal menambah kontak: " + error.message);
    } else {
      await fetchContacts();
      setDashboardStats((prev) => ({
        ...prev,
        totalContacts: prev.totalContacts + 1,
      }));
    }
  };

  // Delete contact
  const deleteContact = async (id: string) => {
    if (supabase && user?.id) {
      await supabase.from("contacts").delete().eq("id", id);
    }
    await fetchContacts();
    setDashboardStats((prev) => ({
      ...prev,
      totalContacts: Math.max(0, prev.totalContacts - 1),
    }));
  };

  // Update campaign status
  const updateCampaignStatus = async (id: string, status: Campaign["status"]) => {
    if (supabase && user?.id) {
      await supabase.from("campaigns").update({ status }).eq("id", id);
    }
    await fetchCampaigns();
    const activeCount = campaigns.filter((c) => c.status === "Running").length;
    setDashboardStats((prev) => ({
      ...prev,
      activeCampaigns: activeCount,
    }));
  };

  // Start campaign dengan rotasi akun dan kirim email via Gmail API
  const startCampaign = async (id: string) => {
    if (!supabase || !user?.id) {
      alert("Silakan login terlebih dahulu!");
      return;
    }
    const campaign = campaigns.find((c: any) => c.id === id);
    if (!campaign) return;
    if (campaign.sender_account_ids.length === 0) {
      alert("Pilih setidaknya satu akun sender!");
      return;
    }

    await updateCampaignStatus(id, "Running");
    let currentIndex = campaign.current_index || 0;
    let totalSent = campaign.sent || 0;
    let totalFailed = campaign.failed || 0;

    for (const contact of contacts) {
      // Rotasi akun sender
      const senderAccountId = campaign.sender_account_ids[currentIndex];
      const senderAccount = senderAccounts.find((acc: any) => acc.id === senderAccountId);
      
      if (!senderAccount?.access_token) {
        console.log(`Akun ${senderAccount?.email} tidak memiliki token, skipping`);
        totalFailed++;
        // Catat log gagal
        await supabase.from("campaign_logs").insert([{
          campaign_id: id,
          contact_id: contact.id,
          sender_account_id: senderAccountId,
          recipient_email: contact.email,
          status: "Failed",
          error_message: "Sender account not connected"
        }]);
      } else {
        try {
          // Kirim email via API
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              senderAccountId,
              to: contact.email,
              subject: campaign.subject,
              body: campaign.body
            })
          });

          if (response.ok) {
            totalSent++;
            // Catat log sukses
            await supabase.from("campaign_logs").insert([{
              campaign_id: id,
              contact_id: contact.id,
              sender_account_id: senderAccountId,
              recipient_email: contact.email,
              status: "Success"
            }]);

            // Update quota sender
            await supabase.from("sender_accounts").update({
              quota_used: (senderAccount.quota_used || 0) + 1
            }).eq("id", senderAccountId);
          } else {
            throw new Error('Failed to send email');
          }
        } catch (error) {
          console.error(`Error mengirim email ke ${contact.email}:`, error);
          totalFailed++;
          // Catat log gagal
          await supabase.from("campaign_logs").insert([{
            campaign_id: id,
            contact_id: contact.id,
            sender_account_id: senderAccountId,
            recipient_email: contact.email,
            status: "Failed",
            error_message: error instanceof Error ? error.message : "Unknown error"
          }]);
        }
      }

      // Update progress
      await supabase.from("campaigns").update({ 
        sent: totalSent, 
        failed: totalFailed,
        current_index: (currentIndex + 1) % campaign.sender_account_ids.length 
      }).eq("id", id);
      
      currentIndex = (currentIndex + 1) % campaign.sender_account_ids.length;

      // Tunggu sesuai interval sebelum mengirim email berikutnya
      await new Promise(resolve => setTimeout(resolve, campaign.interval * 1000));
    }

    await updateCampaignStatus(id, "Completed");
    await fetchCampaigns();
    await fetchSenderAccounts();
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        user,
        session, // Expose session
        senderAccounts,
        contacts,
        campaigns,
        dashboardStats,
        subscription,
        login,
        loginWithGoogle,
        logout,
        addCampaign,
        addContact,
        deleteContact,
        updateCampaignStatus,
        deleteSenderAccount,
        reconnectSenderAccount,
        startCampaign,
        fetchSenderAccounts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
