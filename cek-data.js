
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local!');
  process.exit(1);
}

console.log('Menghubungkan ke Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    enabled: false
  }
});

async function cekData() {
  try {
    console.log('\n=== Cek Tabel sender_accounts ===');
    const { data: accounts, error: errAccounts } = await supabase.from('sender_accounts').select('*');
    if (errAccounts) {
      console.error('Error cek sender_accounts:', errAccounts);
    } else {
      console.log('Jumlah sender accounts:', accounts.length);
      console.log('Data:', accounts);
    }

    console.log('\n=== Cek Tabel contacts ===');
    const { data: contacts, error: errContacts } = await supabase.from('contacts').select('*');
    if (errContacts) {
      console.error('Error cek contacts:', errContacts);
    } else {
      console.log('Jumlah contacts:', contacts.length);
      console.log('Data:', contacts);
    }

    console.log('\n=== Cek Tabel campaigns ===');
    const { data: campaigns, error: errCampaigns } = await supabase.from('campaigns').select('*');
    if (errCampaigns) {
      console.error('Error cek campaigns:', errCampaigns);
    } else {
      console.log('Jumlah campaigns:', campaigns.length);
      console.log('Data:', campaigns);
    }

  } catch (err) {
    console.error('Error umum:', err);
  }
}

cekData();

