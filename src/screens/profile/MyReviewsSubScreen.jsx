import React from 'react';

export default function MyReviewsSubScreen({ reviews = [], onBack, onSelectRestaurant }) {
  return (
    <div className="screen-content bg-gray-50 flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', padding: '64px 20px 16px', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <i className="ti ti-arrow-left" onClick={onBack} style={{ fontSize: '24px', cursor: 'pointer' }}></i>
          <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Ulasan Saya</h1>
        </div>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px 20px' }}>
            <i className="ti ti-message-2" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}></i>
            <p>Belum ada ulasan yang ditulis.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map((rev) => (
              <div key={rev.id} className="card" style={{ padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div 
                      style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', cursor: 'pointer', display: 'inline-block' }}
                      onClick={() => rev.restaurant && onSelectRestaurant(rev.restaurant)}
                    >
                      {rev.restaurant?.name || 'Restoran'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      {new Date(rev.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#F59E0B' }}>
                    <i className="ti ti-star-filled" style={{ marginRight: '4px', fontSize: '14px' }}></i>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>{rev.rating}</span>
                  </div>
                </div>
                {rev.comment && (
                  <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5', margin: 0 }}>
                    "{rev.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
