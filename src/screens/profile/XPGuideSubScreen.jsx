import React from 'react';

export default function XPGuideSubScreen({ onBack }) {
  return (
    <div className="screen-content bg-gray-50 flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', padding: '64px 20px 16px', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <i className="ti ti-arrow-left" onClick={onBack} style={{ fontSize: '24px', cursor: 'pointer' }}></i>
          <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Activities & Rewards</h1>
        </div>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        
        <div style={{ background: 'linear-gradient(135deg, #1B3461 0%, #0F172A 100%)', borderRadius: '16px', padding: '20px', color: 'white', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0' }}>Kumpulkan XP & Naik Level</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5', margin: 0 }}>
            Setiap aktivitasmu di Seato memberikan XP Points. Kumpulkan XP untuk naik level, buka badge, dan tukarkan dengan berbagai reward menarik!
          </p>
        </div>

        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>Cara Mendapatkan XP</h3>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #F1F5F9', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', background: '#F0FDFA', color: '#0EA5A0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-map-pin"></i>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Check-in di Cafe</div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#F59E0B' }}>+5 XP</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', background: '#F0FDFA', color: '#0EA5A0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-star"></i>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Tulis Ulasan & Rating</div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#F59E0B' }}>+10 XP</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', background: '#F0FDFA', color: '#0EA5A0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-photo"></i>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Upload Foto Pengalaman</div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#F59E0B' }}>+5 XP</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', background: '#F0FDFA', color: '#0EA5A0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-thumb-up"></i>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Review Disukai Orang Lain</div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#F59E0B' }}>+10 XP</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', background: '#FFFBEB', color: '#D97706', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-calendar-star"></i>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Kunjungan Pertama Cafe Baru</div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#F59E0B' }}>+15 XP</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', background: '#FFFBEB', color: '#D97706', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-repeat"></i>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Kunjungan Ulang ke Cafe</div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#F59E0B' }}>+10 XP</div>
          </div>
        </div>

        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>Tukar XP Points</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '32px' }}>
          <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
            <i className="ti ti-discount-2" style={{ fontSize: '28px', color: '#0EA5A0', marginBottom: '8px' }}></i>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Discount</div>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
            <i className="ti ti-cup" style={{ fontSize: '28px', color: '#F59E0B', marginBottom: '8px' }}></i>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Free Coffee</div>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
            <i className="ti ti-ticket" style={{ fontSize: '28px', color: '#8B5CF6', marginBottom: '8px' }}></i>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Exclusive Event</div>
          </div>
          <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
            <i className="ti ti-shirt" style={{ fontSize: '28px', color: '#EC4899', marginBottom: '8px' }}></i>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Merchandise</div>
          </div>
        </div>

      </div>
    </div>
  );
}
