"use client";

import { useState } from "react";
import TopHeader from "@/components/TopHeader";
import { useAppContext } from "@/lib/context";
import { Upload, Plus, X, Download } from "lucide-react";

export default function ContactsPage() {
  const { contacts, addContact, deleteContact, deleteMultipleContacts, dashboardStats } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "", nominal: "", tanggal: "" });
  const [search, setSearch] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'complete' | 'email-only'>('complete');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleContactSelection = (id: string) => {
    setSelectedContacts(prev => 
      prev.includes(id) 
        ? prev.filter(contactId => contactId !== id) 
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedContacts.length === 0) return;
    if (confirm(`Anda yakin ingin menghapus ${selectedContacts.length} kontak?`)) {
      await deleteMultipleContacts(selectedContacts);
      setSelectedContacts([]);
    }
  };

  const handleDeleteAll = async () => {
    if (contacts.length === 0) return;
    if (confirm(`Anda yakin ingin menghapus SEMUA ${contacts.length} kontak?`)) {
      await deleteMultipleContacts(contacts.map(c => c.id));
      setSelectedContacts([]);
    }
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContact.name && newContact.email) {
      addContact(newContact);
      setNewContact({ name: "", email: "", nominal: "", tanggal: "" });
      setShowAddModal(false);
    }
  };

  const parseCompleteCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split('|').map(h => h.trim().toLowerCase());
    const nameIndex = headers.indexOf('nama');
    const emailIndex = headers.indexOf('email');
    const nominalIndex = headers.indexOf('nominal');
    const tanggalIndex = headers.indexOf('tanggal');

    if (nameIndex === -1 || emailIndex === -1) {
      alert('Format CSV salah! Harus ada kolom "Nama" dan "Email"');
      return [];
    }

    return lines.slice(1).map(line => {
      const values = line.split('|').map(v => v.trim());
      return {
        name: values[nameIndex],
        email: values[emailIndex],
        nominal: nominalIndex !== -1 ? values[nominalIndex] : "",
        tanggal: tanggalIndex !== -1 ? values[tanggalIndex] : ""
      };
    }).filter(c => c.name && c.email);
  };

  const parseEmailOnlyCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 1) return [];

    return lines.map(line => {
      const email = line.trim();
      // Generate simple name from email
      const name = email.split('@')[0];
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email,
        nominal: "",
        tanggal: ""
      };
    }).filter(c => c.email);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const processUpload = () => {
    if (!uploadedFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsedContacts = uploadType === 'complete' ? parseCompleteCSV(text) : parseEmailOnlyCSV(text);
      if (parsedContacts.length > 0) {
        parsedContacts.forEach(addContact);
        alert(`Berhasil mengupload ${parsedContacts.length} kontak!`);
        setShowUploadModal(false);
        setUploadedFile(null);
      }
    };
    reader.readAsText(uploadedFile);
  };

  const downloadSampleCompleteCSV = () => {
    const sampleContent = "Nama|Email|Nominal|Tanggal\nBudi|budi@contoh.com|100000|2024-01-01\nSiti|siti@contoh.com|150000|2024-01-02\nAndi|andi@contoh.com|200000|2024-01-03";
    const blob = new Blob([sampleContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contoh-kontak-lengkap.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSampleEmailOnlyCSV = () => {
    const sampleContent = "budi@contoh.com\nsiti@contoh.com\nandi@contoh.com";
    const blob = new Blob([sampleContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contoh-email-saja.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main>
      <TopHeader eyebrow="Manage" title="Contacts" />

      <div className="flex gap-3">
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl2 bg-ink py-3 text-sm font-semibold text-canvas shadow-soft"
        >
          <Upload size={16} /> Upload CSV
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex h-12 w-12 items-center justify-center rounded-xl2 bg-card shadow-soft"
        >
          <Plus size={18} className="text-ink" />
        </button>
      </div>

      <input
        placeholder="Cari nama atau email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-4 w-full rounded-full border border-line bg-card px-4 py-3 text-sm placeholder:text-muted focus:outline-none"
      />

      <div className="mt-5 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded"
          />
          <span>{filteredContacts.length} kontak ditampilkan</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{dashboardStats.totalContacts.toLocaleString("id-ID")} total</span>
          {/* Single Multi-Delete Button */}
          {contacts.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 font-semibold"
              title={selectedContacts.length > 0 ? "Hapus terpilih" : "Hapus semua"}
            >
              <img 
                src="/GIF_Under_njoe_lixeira_com_lobo_dentro_cartoon-removebg-preview.png" 
                alt="Delete" 
                className="w-5 h-5 object-contain"
              />
              {selectedContacts.length > 0 ? selectedContacts.length : "Semua"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl2 bg-card p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(c.id)}
                  onChange={() => toggleContactSelection(c.id)}
                  className="w-4 h-4 rounded"
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sand text-sm font-semibold text-ink">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-ink">{c.name}</p>
                  <p className="text-xs text-muted">{c.email}</p>
                  {c.nominal && <p className="text-xs text-ink">Rp {c.nominal}</p>}
                  {c.tanggal && <p className="text-xs text-muted">{c.tanggal}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteContact(c.id)}
                  className="p-2 rounded-full hover:bg-sand"
                >
                  <img 
                    src="/GIF_Under_njoe_lixeira_com_lobo_dentro_cartoon-removebg-preview.png" 
                    alt="Delete" 
                    className="w-6 h-6 object-contain"
                  />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl2 bg-card p-8 text-center shadow-soft">
            <p className="text-muted text-sm">Belum ada kontak</p>
            <p className="text-xs text-muted mt-1">Klik tombol plus untuk menambah kontak pertama</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm relative p-6">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <div className="text-center">
              <div className="flex items-center justify-center mx-auto mb-4">
                <img 
                  src="/GIF_Under_njoe_lixeira_com_lobo_dentro_cartoon-removebg-preview.png" 
                  alt="Delete" 
                  className="w-24 h-24 object-contain"
                />
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">
                {selectedContacts.length > 0 ? "Hapus Kontak Terpilih?" : "Hapus Semua Kontak?"}
              </h3>
              <p className="text-sm text-muted mb-6">
                {selectedContacts.length > 0 
                  ? `Anda yakin ingin menghapus ${selectedContacts.length} kontak terpilih?`
                  : `Anda yakin ingin menghapus SEMUA ${contacts.length} kontak?`
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 px-4 rounded-full bg-gray-100 hover:bg-gray-200 text-ink font-semibold text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    const idsToDelete = selectedContacts.length > 0 ? selectedContacts : contacts.map(c => c.id);
                    await deleteMultipleContacts(idsToDelete);
                    setSelectedContacts([]);
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 py-2 px-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold text-sm"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {dashboardStats.totalContacts > 10 && (
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted">
          <button className="rounded-full bg-card px-3 py-2 shadow-soft">Prev</button>
          <span>Page 1 of {Math.ceil(dashboardStats.totalContacts / 10)}</span>
          <button className="rounded-full bg-ink px-3 py-2 text-canvas shadow-soft">Next</button>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl2 p-6 w-full max-w-md shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-ink">Tambah Kontak Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-sand"
              >
                <X size={18} className="text-ink" />
              </button>
            </div>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Nama</label>
                <input
                  required
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full rounded-lg border border-line p-3 text-sm text-ink bg-canvas"
                  placeholder="Masukkan nama"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full rounded-lg border border-line p-3 text-sm text-ink bg-canvas"
                  placeholder="email@contoh.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Nominal (Opsional)</label>
                <input
                  type="text"
                  value={newContact.nominal}
                  onChange={(e) => setNewContact({ ...newContact, nominal: e.target.value })}
                  className="w-full rounded-lg border border-line p-3 text-sm text-ink bg-canvas"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Tanggal (Opsional)</label>
                <input
                  type="date"
                  value={newContact.tanggal}
                  onChange={(e) => setNewContact({ ...newContact, tanggal: e.target.value })}
                  className="w-full rounded-lg border border-line p-3 text-sm text-ink bg-canvas"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-canvas"
              >
                Tambah Kontak
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload CSV Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl2 p-6 w-full max-w-md shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-ink">Upload CSV</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-full hover:bg-sand"
              >
                <X size={18} className="text-ink" />
              </button>
            </div>

            {/* Pilih Tipe Upload */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setUploadType('complete')}
                className={`flex-1 py-2 px-3 rounded-full text-sm font-semibold transition-colors ${
                  uploadType === 'complete' ? 'bg-ink text-canvas' : 'bg-sand text-ink'
                }`}
              >
                Lengkap
              </button>
              <button
                onClick={() => setUploadType('email-only')}
                className={`flex-1 py-2 px-3 rounded-full text-sm font-semibold transition-colors ${
                  uploadType === 'email-only' ? 'bg-ink text-canvas' : 'bg-sand text-ink'
                }`}
              >
                Email Saja
              </button>
            </div>

            {/* Contoh Format */}
            <div className="mb-4 p-4 bg-sand rounded-xl border border-line">
              <p className="font-semibold text-ink text-sm mb-2">Contoh Format CSV:</p>
              {uploadType === 'complete' && (
                <img
                  src="/contoh.png"
                  alt="Contoh format CSV"
                  className="w-full rounded-lg border border-line mb-3"
                />
              )}
              <button
                onClick={uploadType === 'complete' ? downloadSampleCompleteCSV : downloadSampleEmailOnlyCSV}
                className="flex items-center gap-2 text-xs font-semibold text-ink"
              >
                <Download size={14} /> Download contoh CSV
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-line rounded-xl p-6 text-center">
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="csv-file"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload size={32} className="text-muted" />
                  <p className="text-sm text-muted">
                    {uploadedFile ? uploadedFile.name : "Klik untuk memilih file CSV"}
                  </p>
                </label>
              </div>
              <button
                onClick={processUpload}
                disabled={!uploadedFile}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-canvas disabled:opacity-50"
              >
                Upload Kontak
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
