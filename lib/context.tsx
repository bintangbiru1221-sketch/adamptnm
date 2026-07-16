"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
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

interface ProcessLog {
  type: 'info' | 'success' | 'error' | 'wait';
  message: string;
  timestamp: Date;
}

interface AppContextType {
  isLoggedIn: boolean;
  user: { email: string; id?: string } | null;
  session: any; // Tambahkan session
  senderAccounts: any[];
  contacts: any[];
  campaigns: any[];
  dashboardStats: DashboardStats;
  subscription: Subscription;
  isLoading: boolean;
  authInitialized: boolean;
  login: (email: string) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addCampaign: (campaign: any) => Promise<void>;
  addContact: (contact: any) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  deleteMultipleContacts: (ids: string[]) => Promise<void>;
  updateCampaignStatus: (id: string, status: any) => Promise<void>;
  updateCampaign: (id: string, data: any) => Promise<void>;
  deleteSenderAccount: (id: string) => Promise<void>;
  reconnectSenderAccount: (id: string) => Promise<void>;
  startCampaign: (id: string) => Promise<void>;
  fetchSenderAccounts: () => Promise<void>;
  fetchContacts: () => Promise<void>;
  fetchCampaigns: () => Promise<void>;
  getCampaignLogs: (campaignId: string) => Promise<any[]>;
  getProcessLogs: (campaignId: string) => ProcessLog[];
  clearProcessLogs: (campaignId: string) => void;
}

// Create Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Component
export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string; id?: string } | null>(null);
  const [session, setSession] = useState<any>(null); // Tambahkan state session
  const [senderAccounts, setSenderAccounts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState(initialDashboardStats);
  const [subscription, setSubscription] = useState(initialSubscription);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processLogs, setProcessLogs] = useState<Record<string, ProcessLog[]>>({});

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
    });
    if (error) {
      console.error("Error login with Google:", error);
      alert("Error saat login dengan Google: " + error.message);
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
    // Reset semua state menjadi kosong saat logout
    setSenderAccounts([]);
    setContacts([]);
    setCampaigns([]);
    setProcessLogs({});
    setDashboardStats(initialDashboardStats);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("welcomeModalShown");
  };

  // Fetch sender accounts from Supabase
  const fetchSenderAccounts = useCallback(async () => {
    if (!supabase || !user?.id) {
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("sender_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        alert("Gagal mengambil akun sender: " + error.message);
        setSenderAccounts([]);
      } else if (data) {
        setSenderAccounts(data as any);
        setDashboardStats((prev) => ({
          ...prev,
          gmailConnected: data.filter((acc: any) => acc.access_token).length,
        }));
      } else {
        setSenderAccounts([]);
      }
    } catch (e) {
      setSenderAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.id]);

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
  const fetchContacts = useCallback(async () => {
    if (!supabase || !user?.id) {
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        alert("Gagal mengambil kontak: " + error.message);
        setContacts([]);
      } else if (data) {
        setContacts(data as any);
        setDashboardStats((prev) => ({
          ...prev,
          totalContacts: data.length,
        }));
      } else {
        setContacts([]);
      }
    } catch (e) {
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.id]);

  // Fetch campaigns from Supabase
  const fetchCampaigns = useCallback(async () => {
    if (!supabase || !user?.id) {
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        alert("Gagal mengambil campaign: " + error.message);
        setCampaigns([]);
      } else if (data) {
        setCampaigns(data as any);
        setDashboardStats((prev) => ({
          ...prev,
          totalCampaigns: data.length,
          activeCampaigns: data.filter((c: any) => c.status === "Running").length,
        }));
      } else {
        setCampaigns([]);
      }
    } catch (e) {
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.id]);

  // Check Supabase session OR localStorage on mount
  useEffect(() => {
    if (supabase) {
      // Cek session awal
      const checkSession = async () => {
        const { data: { session }, error } = await supabase!.auth.getSession();
        setSession(session);
        if (session?.user) {
          setIsLoggedIn(true);
          setUser({ email: session.user.email!, id: session.user.id });
        }
        setAuthInitialized(true);
      };
      checkSession();

      // Listener untuk perubahan auth state
      const { data: { subscription } } = supabase!.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          if (session?.user) {
            setIsLoggedIn(true);
            setUser({ email: session.user.email!, id: session.user.id });
          } else {
            setIsLoggedIn(false);
            setUser(null);
            setSession(null);
            // Reset semua state ketika logout
            setSenderAccounts([]);
            setContacts([]);
            setCampaigns([]);
            setProcessLogs({});
            setDashboardStats(initialDashboardStats);
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

  // Fetch data when auth is initialized and user is logged in
  useEffect(() => {
    const loadData = async () => {
      if (authInitialized && isLoggedIn && user?.id) {
        setSenderAccounts([]);
        setContacts([]);
        setCampaigns([]);
        await fetchSenderAccounts();
        await fetchContacts();
        await fetchCampaigns();
      }
    };
    loadData();
  }, [authInitialized, isLoggedIn, user?.id, fetchSenderAccounts, fetchContacts, fetchCampaigns]);

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

  // Delete multiple contacts
  const deleteMultipleContacts = async (ids: string[]) => {
    if (supabase && user?.id && ids.length > 0) {
      await supabase.from("contacts").delete().in("id", ids);
      await fetchContacts();
      setDashboardStats((prev) => ({
        ...prev,
        totalContacts: Math.max(0, prev.totalContacts - ids.length),
      }));
    }
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

  // Update campaign detail
  const updateCampaign = async (id: string, data: any) => {
    if (!supabase || !user?.id) {
      alert("Silakan login terlebih dahulu!");
      return;
    }
    const { error } = await supabase
      .from("campaigns")
      .update(data)
      .eq("id", id);
    if (error) {
      alert("Gagal mengupdate campaign: " + error.message);
    } else {
      await fetchCampaigns();
    }
  };

  // Get campaign logs
  const getCampaignLogs = async (campaignId: string) => {
    if (!supabase || !user?.id) return [];
    const { data, error } = await supabase
      .from("campaign_logs")
      .select("*, sender_accounts (email)")
      .eq("campaign_id", campaignId)
      .order("sent_at", { ascending: false });
    if (error) {
      console.error("Error fetching logs:", error);
      return [];
    }
    return data || [];
  };

  // Add process log for a campaign
  const addProcessLog = (campaignId: string, log: Omit<ProcessLog, 'timestamp'>) => {
    setProcessLogs(prev => ({
      ...prev,
      [campaignId]: [
        ...(prev[campaignId] || []),
        { ...log, timestamp: new Date() }
      ]
    }));
  };

  // Get process logs for a campaign
  const getProcessLogs = (campaignId: string): ProcessLog[] => {
    return processLogs[campaignId] || [];
  };

  // Clear process logs for a campaign
  const clearProcessLogs = (campaignId: string) => {
    setProcessLogs(prev => {
      const newLogs = { ...prev };
      delete newLogs[campaignId];
      return newLogs;
    });
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

    clearProcessLogs(id);
    addProcessLog(id, {
      type: 'info',
      message: `Memulai campaign "${campaign.name}"...`
    });

    await updateCampaignStatus(id, "Running");
    addProcessLog(id, {
      type: 'info',
      message: `Status campaign diubah menjadi "Running"`
    });

    let currentIndex = campaign.current_index || 0;
    let totalSent = campaign.sent || 0;
    let totalFailed = campaign.failed || 0;

    addProcessLog(id, {
      type: 'info',
      message: `Total kontak: ${contacts.length}, Total akun sender: ${campaign.sender_account_ids.length}`
    });

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      // Rotasi akun sender
      const senderAccountId = campaign.sender_account_ids[currentIndex];
      const senderAccount = senderAccounts.find((acc: any) => acc.id === senderAccountId);
      
      addProcessLog(id, {
        type: 'info',
        message: `Memproses kontak ${i + 1}/${contacts.length}: ${contact.email}`
      });

      addProcessLog(id, {
        type: 'info',
        message: `Memilih akun sender: ${senderAccount?.email || 'Unknown'}`
      });

      if (!senderAccount?.access_token) {
        addProcessLog(id, {
          type: 'error',
          message: `Akun ${senderAccount?.email} tidak memiliki token!`
        });
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
          addProcessLog(id, {
            type: 'info',
            message: `Mengirim email ke ${contact.email}...`
          });
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
            addProcessLog(id, {
              type: 'success',
              message: `Email berhasil dikirim ke ${contact.email}!`
            });
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
            addProcessLog(id, {
              type: 'info',
              message: `Quota akun ${senderAccount.email} diperbarui: ${(senderAccount.quota_used || 0) + 1}/${senderAccount.quota_limit}`
            });
          } else {
            throw new Error('Failed to send email');
          }
        } catch (error) {
          addProcessLog(id, {
            type: 'error',
            message: `Gagal mengirim email ke ${contact.email}: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
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
      addProcessLog(id, {
        type: 'info',
        message: `Memperbarui progress campaign...`
      });
      await supabase.from("campaigns").update({ 
        sent: totalSent, 
        failed: totalFailed,
        current_index: (currentIndex + 1) % campaign.sender_account_ids.length 
      }).eq("id", id);
      
      currentIndex = (currentIndex + 1) % campaign.sender_account_ids.length;

      if (i < contacts.length - 1) {
        addProcessLog(id, {
          type: 'wait',
          message: `Menunggu ${campaign.interval} detik sebelum mengirim email berikutnya...`
        });
        // Tunggu sesuai interval sebelum mengirim email berikutnya
        await new Promise(resolve => setTimeout(resolve, campaign.interval * 1000));
      }
    }

    addProcessLog(id, {
      type: 'success',
      message: `Campaign selesai! Total terkirim: ${totalSent}, Total gagal: ${totalFailed}`
    });
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
        isLoading,
        authInitialized,
        login,
        loginWithGoogle,
        logout,
        addCampaign,
        addContact,
        deleteContact,
        deleteMultipleContacts,
        updateCampaignStatus,
        updateCampaign,
        deleteSenderAccount,
        reconnectSenderAccount,
        startCampaign,
        fetchSenderAccounts,
        fetchContacts,
        fetchCampaigns,
        getCampaignLogs,
        getProcessLogs,
        clearProcessLogs,
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
