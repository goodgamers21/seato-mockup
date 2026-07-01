import React, { useState } from 'react';

export default function AkunScreen({ currentUser, onLogout, onBack }) {
  const [notifOn, setNotifOn] = useState(true);

  if (!currentUser) return <div className="screen-content" style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div className="screen-content bg-gray-50 flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ background: 'white', padding: '64px 20px 24px', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onBack && <i className="ti ti-arrow-left" onClick={onBack} style={{ fontSize: '24px', cursor: 'pointer' }}></i>}
          <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Pengaturan Akun</h1>
        </div>
      </div>

      <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto' }}>
        
        <h2 className="text-muted" style={{ marginBottom: '12px', fontSize: '13px' }}>Profil Saya</h2>
        <div className="menu-list" style={{ background: 'white', borderRadius: '16px', marginBottom: '24px' }}>
           <div className="menu-item"><i className="ti ti-user-edit"></i> <span className="text-navy" style={{ fontWeight: 600, flex: 1 }}>Ubah Profil</span> <i className="ti ti-chevron-right text-muted"></i></div>
           <div className="menu-item"><i className="ti ti-lock"></i> <span className="text-navy" style={{ fontWeight: 600, flex: 1 }}>Ubah Password</span> <i className="ti ti-chevron-right text-muted"></i></div>
        </div>

        <h2 className="text-muted" style={{ marginBottom: '12px', fontSize: '13px' }}>Pengaturan Aplikasi</h2>
        <div className="menu-list" style={{ background: 'white', borderRadius: '16px', marginBottom: '24px' }}>
          <div className="menu-item" onClick={() => setNotifOn(!notifOn)}>
            <i className="ti ti-bell"></i> 
            <span className="text-navy" style={{ fontWeight: 600, flex: 1 }}>Notifikasi</span> 
            <div className={`toggle-switch ${!notifOn ? 'off' : ''}`}></div>
          </div>
          <div className="menu-item"><i className="ti ti-map-pin"></i> <span className="text-navy" style={{ fontWeight: 600, flex: 1 }}>Lokasi</span> <span className="caption">{currentUser.location || '-'}</span></div>
          <div className="menu-item"><i className="ti ti-language"></i> <span className="text-navy" style={{ fontWeight: 600, flex: 1 }}>Bahasa</span> <span className="caption">Indonesia</span></div>
        </div>

        <h2 className="text-muted" style={{ marginBottom: '12px', fontSize: '13px' }}>Lainnya</h2>
        <div className="menu-list" style={{ background: 'white', borderRadius: '16px', marginBottom: '40px' }}>
          <div className="menu-item"><i className="ti ti-help"></i> <span className="text-navy" style={{ fontWeight: 600, flex: 1 }}>Pusat Bantuan</span></div>
          <div className="menu-item"><i className="ti ti-file-text"></i> <span className="text-navy" style={{ fontWeight: 600, flex: 1 }}>Syarat & Ketentuan</span></div>
          <div className="menu-item"><i className="ti ti-shield"></i> <span className="text-navy" style={{ fontWeight: 600, flex: 1 }}>Kebijakan Privasi</span></div>
          <div className="menu-item" onClick={onLogout} style={{ cursor: 'pointer' }}>
            <i className="ti ti-logout" style={{ color: '#E11D48' }}></i> 
            <span style={{ fontWeight: 600, color: '#E11D48', flex: 1 }}>Keluar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
