import React, { useState } from 'react';

export default function DaftarKomunitasModal({ currentUser, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('RUNNING');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const CATEGORIES = [
    { id: 'RUNNING', label: 'Lari / Running' },
    { id: 'CYCLING', label: 'Sepeda / Cycling' },
    { id: 'PADEL', label: 'Padel Tennis' },
    { id: 'HIKING', label: 'Hiking & Outdoor' },
    { id: 'BOARDGAME', label: 'Boardgame' },
    { id: 'ESPORT', label: 'Esport & Gaming' },
    { id: 'OTHER', label: 'Lainnya' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama komunitas wajib diisi');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim(),
          logoUrl: logoUrl.trim() || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=400&q=80',
          picUserId: currentUser.id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar');

      onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'white', padding: '24px', borderRadius: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Daftarkan Komunitas</h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>Anda akan otomatis menjadi PIC Resmi</p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
            ✕
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Nama Komunitas</label>
            <input
              type="text"
              placeholder="Contoh: Sudirman Sunrise Runners"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '14px', background: '#F8FAFC' }}
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Deskripsi & Visi</label>
            <textarea
              placeholder="Ceritakan aktivitas rutin komunitas Anda..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', height: '80px', padding: '10px 12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '13px', resize: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>URL Foto / Logo (Opsional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '13px' }}
            />
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '12px', fontSize: '11px', color: '#64748B', lineHeight: '1.4' }}>
            ℹ️ Komunitas baru berstatus <strong>Menunggu Kurasi</strong> oleh Tim Seato Ops untuk memastikan legalitas dan menjaga standar keamanan merchant partner.
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', fontWeight: 700, cursor: 'pointer' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', background: '#1B3461', color: 'white', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
