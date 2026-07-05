import React from 'react';

export default function FavoritesSubScreen({ favorites = [], onBack, onSelectRestaurant }) {
  return (
    <div className="screen-content bg-gray-50 flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', padding: '64px 20px 16px', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <i className="ti ti-arrow-left" onClick={onBack} style={{ fontSize: '24px', cursor: 'pointer' }}></i>
          <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Restoran Favorit</h1>
        </div>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        {favorites.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px 20px' }}>
            <i className="ti ti-heart-broken" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}></i>
            <p>Belum ada restoran favorit.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {favorites.map((fav) => (
              <div 
                key={fav.id} 
                className="card" 
                style={{ padding: '16px', borderRadius: '16px', display: 'flex', gap: '12px', cursor: 'pointer' }}
                onClick={() => onSelectRestaurant(fav.restaurant)}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={fav.restaurant.imageUrl || 'https://via.placeholder.com/150'} alt={fav.restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#0F172A' }}>{fav.restaurant.name}</h3>
                    <i className="ti ti-heart-filled" style={{ color: '#E11D48', fontSize: '18px' }} onClick={(e) => { e.stopPropagation(); /* Handle remove favorite */ }}></i>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
                    {fav.restaurant.type} • {fav.restaurant.city}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    <i className="ti ti-star-filled" style={{ color: '#F59E0B', fontSize: '14px' }}></i>
                    {fav.restaurant.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
