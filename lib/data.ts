export const senderAccounts = [];

export const contacts = [];

export const campaigns = [];

export const campaignLogs = [];

export const dashboardStats = {
  totalContacts: 0,
  totalCampaigns: 0,
  gmailConnected: 0,
  activeCampaigns: 0,
};

export const subscription = {
  plan: "Trial",
  expiredAt: "30 Jul 2026",
  gmailLimit: 1,
  contactLimit: 100,
  image: "/subscription.jpg"
};

export const plans = [
  { 
    name: "Trial", 
    price: "Gratis", 
    gmail: "1 Gmail", 
    contacts: "100 kontak", 
    extra: "1 campaign aktif",
    image: "/plan-trial.jpg"
  },
  { 
    name: "Basic", 
    price: "Rp99rb/bln", 
    gmail: "2 Gmail", 
    contacts: "2.000 kontak", 
    extra: "Unlimited campaign",
    image: "/plan-basic.jpg"
  },
  { 
    name: "Pro", 
    price: "Rp299rb/bln", 
    gmail: "5 Gmail", 
    contacts: "10.000 kontak", 
    extra: "Auto Rotate",
    image: "/plan-pro.jpg"
  },
];
