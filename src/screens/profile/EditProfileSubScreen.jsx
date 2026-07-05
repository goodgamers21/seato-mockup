import React, { useState } from 'react';

export default function EditProfileSubScreen({ profile, onBack, onSave }) {
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/profile/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, location })
      });
      if (onSave) onSave();
      onBack();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="screen-content bg-white flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '64px 20px 16px', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, zIndex: 10, background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <i className="ti ti-arrow-left" onClick={onBack} style={{ fontSize: '24px', cursor: 'pointer' }}></i>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Ubah Profil</h1>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            style={{ background: 'none', border: 'none', color: '#0EA5A0', fontSize: '15px', fontWeight: 700, cursor: 'pointer', padding: '4px 8px' }}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: '#1B3461', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 800, marginBottom: '12px', position: 'relative' }}>
            {profile?.initials}
            <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#0EA5A0', width: '28px', height: '28px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
               <i className="ti ti-camera" style={{ fontSize: '14px' }}></i>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>Nama Lengkap</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '15px', color: '#0F172A', outline: 'none' }} 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>Bio</label>
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '15px', color: '#0F172A', outline: 'none', resize: 'none' }} 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>Kota/Lokasi</label>
          <select 
            value={location} 
            onChange={(e) => setLocation(e.target.value)}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '15px', color: '#0F172A', outline: 'none', background: 'white' }} 
          >
            <option value="Jakarta">Jakarta</option>
            <option value="Bandung">Bandung</option>
            <option value="Surabaya">Surabaya</option>
            <option value="Yogyakarta">Yogyakarta</option>
            <option value="Semarang">Semarang</option>
          </select>
        </div>

      </div>
    </div>
  );
}
