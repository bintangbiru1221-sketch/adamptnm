-- =============================================
-- Schema untuk Multi Gmail Wetan
-- =============================================

-- 1. Tabel User Profiles (menyimpan data user tambahan)
CREATE TABLE IF NOT EXISTS public.users_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Sender Accounts (akun Gmail yang terhubung)
CREATE TABLE IF NOT EXISTS public.sender_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'Connected' CHECK (status IN ('Connected', 'Disconnected')),
    quota_used INTEGER DEFAULT 0,
    quota_limit INTEGER DEFAULT 500,
    access_token TEXT,
    refresh_token TEXT,
    token_expiry BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    sender_account_ids UUID[] DEFAULT '{}', -- Array akun sender untuk rotasi
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    total_contacts INTEGER DEFAULT 0,
    sent INTEGER DEFAULT 0,
    failed INTEGER DEFAULT 0,
    current_index INTEGER DEFAULT 0, -- Index untuk rotasi akun
    batch_size INTEGER DEFAULT 10,
    interval INTEGER DEFAULT 60,
    status TEXT DEFAULT 'Queued' CHECK (status IN ('Queued', 'Running', 'Paused', 'Completed')),
    eta TEXT,
    image TEXT DEFAULT '/recent-product.jpg',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Contacts
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    nominal TEXT,
    tanggal TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Campaign Logs (catatan hasil pengiriman)
CREATE TABLE IF NOT EXISTS public.campaign_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    sender_account_id UUID REFERENCES public.sender_accounts(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    status TEXT CHECK (status IN ('Success', 'Failed')),
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Enable Row Level Security (RLS) untuk semua tabel
-- =============================================
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sender_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies: User hanya bisa mengakses data miliknya sendiri
-- =============================================

-- Policies untuk users_profiles
CREATE POLICY "Users can view their own profile" 
    ON public.users_profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.users_profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Policies untuk sender_accounts
CREATE POLICY "Users can view their own sender accounts" 
    ON public.sender_accounts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sender accounts" 
    ON public.sender_accounts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sender accounts" 
    ON public.sender_accounts FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sender accounts" 
    ON public.sender_accounts FOR DELETE 
    USING (auth.uid() = user_id);

-- Policies untuk campaigns
CREATE POLICY "Users can view their own campaigns" 
    ON public.campaigns FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns" 
    ON public.campaigns FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
    ON public.campaigns FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
    ON public.campaigns FOR DELETE 
    USING (auth.uid() = user_id);

-- Policies untuk contacts
CREATE POLICY "Users can view their own contacts" 
    ON public.contacts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts" 
    ON public.contacts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
    ON public.contacts FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
    ON public.contacts FOR DELETE 
    USING (auth.uid() = user_id);

-- Policies untuk campaign_logs
CREATE POLICY "Users can view their own campaign logs" 
    ON public.campaign_logs FOR SELECT 
    USING (auth.uid() = (SELECT user_id FROM public.campaigns WHERE id = campaign_logs.campaign_id));

CREATE POLICY "Users can insert their own campaign logs" 
    ON public.campaign_logs FOR INSERT 
    WITH CHECK (auth.uid() = (SELECT user_id FROM public.campaigns WHERE id = campaign_logs.campaign_id));

-- =============================================
-- Trigger untuk otomatis buat profile ketika user baru daftar
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users_profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Panduan Setup Auth Google di Supabase:
-- =============================================
-- 1. Buka https://console.cloud.google.com/
-- 2. Buat project baru
-- 3. Buka APIs & Services > Credentials
-- 4. Buat OAuth Client ID (tipe Web Application)
-- 5. Tambahkan Authorized JavaScript origins:
--    - https://[project-id].supabase.co
--    - http://localhost:3000
-- 6. Tambahkan Authorized redirect URIs:
--    - https://[project-id].supabase.co/auth/v1/callback
-- 7. Copy Client ID & Client Secret
-- 8. Buka Supabase Dashboard > Authentication > Providers > Google
-- 9. Masukkan Client ID & Client Secret, lalu enable
-- =============================================
