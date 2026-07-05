import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function RestaurantDetailScreen({ restaurant, currentUser, onBack, onBooking }) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  useEffect(() => {
    if (currentUser && restaurant) {
      fetch(`/api/favorites?userId=${currentUser.id}&restaurantId=${restaurant.id}`)
        .then(res => res.json())
        .then(data => setIsFavorite(data.isFavorite))
        .catch(console.error);
    }
  }, [currentUser, restaurant]);

  const toggleFavorite = async () => {
    if (!currentUser) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }
    setIsLoadingFavorite(true);
    try {
      if (isFavorite) {
        await fetch(`/api/favorites?userId=${currentUser.id}&restaurantId=${restaurant.id}`, { method: 'DELETE' });
        setIsFavorite(false);
        toast.success('Dihapus dari favorit');
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, restaurantId: restaurant.id })
        });
        setIsFavorite(true);
        toast.success('Ditambahkan ke favorit');
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal memperbarui favorit');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  if (!restaurant) return null;

  const occ = restaurant.occupancy;
  const occPct = occ && occ.total > 0 ? Math.round((occ.filled / occ.total) * 100) : 0;
  
  const statusLabel = occPct >= 90 ? 'Full' : occPct >= 60 ? 'Busy' : 'Available';
  const statusColor = occPct >= 90 ? '#EF4444' : occPct >= 60 ? '#F59E0B' : '#0EA5A0';
  const statusBg = occPct >= 90 ? '#FEF2F2' : occPct >= 60 ? '#FFFBEB' : '#F0FDFA';
  const statusBorderColor = occPct >= 90 ? '#FCA5A5' : occPct >= 60 ? '#FCD34D' : '#99F6E4';
  const displayPct = occPct >= 90 ? occPct : occPct >= 60 ? occPct : (100 - occPct);

  // Calculate true availability from areas data
  let seatoOccupied = 0;
  let seatoAllocated = 0;
  let walkInOccupied = 0;
  let walkInAllocated = 0;

  if (restaurant.areas && restaurant.areas.length > 0) {
    restaurant.areas.forEach(a => {
      seatoOccupied += a.seatoOccupied;
      seatoAllocated += a.seatoAllocated;
      walkInOccupied += a.walkInOccupied;
      walkInAllocated += (a.total - a.seatoAllocated);
    });
  } else {
    // Fallback logic
    seatoOccupied = 10;
    seatoAllocated = 10;
    walkInOccupied = 0;
    walkInAllocated = 10;
  }

  const isSeatoFull = seatoAllocated > 0 ? seatoOccupied >= seatoAllocated : true;
  const isWalkinAvailable = walkInOccupied < walkInAllocated;
  
  const seatoStatusColor = isSeatoFull ? '#EF4444' : '#0EA5A0';
  const seatoStatusBg = isSeatoFull ? '#FEF2F2' : '#F0FDFA';
  const seatoBorderColor = isSeatoFull ? '#FCA5A5' : '#99F6E4';

  const filledIconsCount = Math.round((occPct / 100) * 5);
  
  // Facilities mapped with icons
  const facilities = [
    { label: 'WFC Friendly', icon: 'ti-device-laptop' },
    { label: 'Smoking Indoor', icon: 'ti-smoking' },
    { label: 'Outdoor Area', icon: 'ti-tree' },
    { label: 'Family Friendly', icon: 'ti-users' }
  ];

  // Placeholder images for Ambiance
  const ambianceImages = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=400&q=80'
  ];

  return (
    <div className="screen-content" style={{ paddingBottom: 0, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      
      {/* Hero Header */}
      <div style={{ position: 'relative', height: '340px', backgroundImage: `url(${restaurant.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        
        {/* Dark Gradient Overlay for text readability */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)' }}></div>

        {/* Back & Actions */}
        <div style={{ position: 'absolute', top: '56px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
          <div 
            onClick={onBack}
            style={{ width: '40px', height: '40px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
          >
            <i className="ti ti-arrow-left" style={{ fontSize: '20px' }}></i>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div 
              onClick={isLoadingFavorite ? null : toggleFavorite}
              style={{ width: '40px', height: '40px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isFavorite ? '#E11D48' : 'white', cursor: 'pointer' }}
            >
              <i className={isFavorite ? "ti ti-heart-filled" : "ti ti-heart"} style={{ fontSize: '20px' }}></i>
            </div>
            <div style={{ width: '40px', height: '40px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
              <i className="ti ti-share" style={{ fontSize: '20px' }}></i>
            </div>
          </div>
        </div>

        {/* Title and Rating on Hero Image */}
        <div style={{ position: 'absolute', bottom: '40px', left: '20px', right: '20px', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', margin: '0 0 4px 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              {restaurant.name}
            </h1>
            <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              {restaurant.type} • {restaurant.distance || '1.2 km'}
            </div>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '8px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'white', fontWeight: 700, fontSize: '15px' }}>
              <i className="ti ti-star-filled" style={{ color: '#FBBF24', fontSize: '16px' }}></i> {restaurant.rating} <span style={{ fontWeight: 400, opacity: 0.8, fontSize: '13px' }}>({restaurant.reviewsCount || 120})</span>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>120+ ulasan</div>
          </div>
        </div>
      </div>

      {/* Detail Content */}
      <div style={{ flex: 1, background: '#FFFFFF', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', marginTop: '-24px', position: 'relative', zIndex: 5, padding: '24px 20px', overflowY: 'auto', paddingBottom: '120px' }}>
        
        {/* Facilities Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {facilities.map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #E2E8F0', color: '#1E293B', fontSize: '13px', fontWeight: 600, padding: '8px 14px', borderRadius: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
              <i className={`ti ${f.icon}`} style={{ color: '#0EA5A0', fontSize: '16px' }}></i>
              {f.label}
            </div>
          ))}
        </div>

        {/* Live Occupancy Card */}
        <div style={{ border: `1px solid ${statusBorderColor}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', marginBottom: '16px', boxShadow: '0 4px 12px rgba(14, 165, 160, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: statusBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColor }}>
              <i className="ti ti-users" style={{ fontSize: '24px' }}></i>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#1E293B', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '3px', background: statusColor }}></div>
                LIVE OCCUPANCY
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: statusColor, lineHeight: '1' }}>{statusLabel}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', marginTop: '2px' }}>{occPct}% Terisi</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>(Berdasarkan seluruh kapasitas)</div>
              <div style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <i className="ti ti-clock" style={{ fontSize: '12px' }}></i> Update 2 menit lalu
              </div>
            </div>
          </div>
        </div>

        {/* SEATO Availability Card */}
        <div style={{ border: `1px solid ${seatoBorderColor}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'flex-start', background: 'white', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: seatoStatusBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: seatoStatusColor, flexShrink: 0 }}>
            <i className="ti ti-calendar-event" style={{ fontSize: '24px' }}></i>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#1E293B', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '3px', background: seatoStatusColor }}></div>
              SEATO AVAILABILITY
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: seatoStatusColor, lineHeight: '1', marginTop: '2px' }}>{isSeatoFull ? 'Fully Booked' : 'Available'}</div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>{seatoAllocated - seatoOccupied} slot tersisa</div>
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: isWalkinAvailable ? '#0EA5A0' : '#64748B', background: isWalkinAvailable ? '#F0FDFA' : '#F8FAFC', padding: '8px 14px', borderRadius: '12px', border: `1px solid ${isWalkinAvailable ? '#99F6E4' : '#E2E8F0'}`, whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                 <i className={isWalkinAvailable ? "ti ti-check" : "ti ti-x"} style={{ fontSize: '14px' }}></i>
                 {isWalkinAvailable ? 'Walk-in Tersedia' : 'Walk-in Penuh'}
              </div>
            </div>
          </div>
        </div>

        {/* Popularity Banner */}
        <div style={{ background: '#F1F5F9', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', marginRight: '-8px' }}>
              <img src="https://i.pravatar.cc/100?img=1" alt="user" style={{ width: '28px', height: '28px', borderRadius: '14px', border: '2px solid #F1F5F9', zIndex: 3 }} />
              <img src="https://i.pravatar.cc/100?img=2" alt="user" style={{ width: '28px', height: '28px', borderRadius: '14px', border: '2px solid #F1F5F9', zIndex: 2, marginLeft: '-10px' }} />
              <img src="https://i.pravatar.cc/100?img=3" alt="user" style={{ width: '28px', height: '28px', borderRadius: '14px', border: '2px solid #F1F5F9', zIndex: 1, marginLeft: '-10px' }} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>324 orang reservasi minggu ini</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Jadi favorit pekerja remote di Kudus! 🔥</div>
            </div>
          </div>
          <i className="ti ti-chevron-right" style={{ color: '#94A3B8', fontSize: '16px' }}></i>
        </div>

        {/* Cafe Score Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 700, color: '#1E293B' }}>
              <i className="ti ti-award" style={{ color: '#0EA5A0', fontSize: '20px' }}></i> Cafe Score
            </div>
          </div>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{restaurant.rating}</div>
                <div style={{ display: 'flex', color: '#F59E0B', gap: '2px', marginTop: '4px' }}>
                  {[1, 2, 3, 4, 5].map(i => <i key={i} className={`ti ti-star${i <= Math.round(restaurant.rating) ? '-filled' : ''}`}></i>)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{restaurant.reviewsCount} Ulasan</div>
              </div>
              <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: '#F0FDFA', border: '4px solid #0EA5A0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#0EA5A0' }}>70%</span>
                <span style={{ fontSize: '9px', textAlign: 'center', color: '#0F766E', fontWeight: 600, padding: '0 4px', lineHeight: 1.1 }}>Reviews dari Certified Hoppers</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ width: '70px', color: '#475569' }}>Taste</span>
                <div style={{ flex: 1, height: '6px', background: '#F1F5F9', borderRadius: '3px', margin: '0 12px' }}>
                  <div style={{ width: '90%', height: '100%', background: '#F59E0B', borderRadius: '3px' }}></div>
                </div>
                <span style={{ width: '24px', fontWeight: 600 }}>4.7</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ width: '70px', color: '#475569' }}>Ambiance</span>
                <div style={{ flex: 1, height: '6px', background: '#F1F5F9', borderRadius: '3px', margin: '0 12px' }}>
                  <div style={{ width: '85%', height: '100%', background: '#F59E0B', borderRadius: '3px' }}></div>
                </div>
                <span style={{ width: '24px', fontWeight: 600 }}>4.5</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ width: '70px', color: '#475569' }}>Service</span>
                <div style={{ flex: 1, height: '6px', background: '#F1F5F9', borderRadius: '3px', margin: '0 12px' }}>
                  <div style={{ width: '80%', height: '100%', background: '#F59E0B', borderRadius: '3px' }}></div>
                </div>
                <span style={{ width: '24px', fontWeight: 600 }}>4.4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Hoppers Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 700, color: '#1E293B' }}>
              <i className="ti ti-medal" style={{ color: '#0EA5A0', fontSize: '20px' }}></i> Recommended by Top Hoppers
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', margin: '0 -20px', padding: '0 20px' }}>
            <div style={{ width: '120px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: '#1B3461', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, margin: '0 auto 8px' }}>AR</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Arif</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Level 18</div>
            </div>
            <div style={{ width: '120px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: '#1B3461', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, margin: '0 auto 8px' }}>DN</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dandy</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Level 12</div>
            </div>
            <div style={{ width: '120px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: '#1B3461', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, margin: '0 auto 8px' }}>BA</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Bagus Aji</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Level 10</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0, fontWeight: 400 }}>
            Restoran dan cafe modern dengan suasana yang nyaman, cocok untuk bersantai maupun bekerja. Menawarkan menu spesial yang diracik oleh chef profesional dengan bahan pilihan terbaik.
          </p>
        </div>

        {/* Suasana Tempat (Ambiance) */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 700, color: '#1E293B' }}>
              <i className="ti ti-photo" style={{ color: '#0EA5A0', fontSize: '20px' }}></i> Suasana Tempat
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0EA5A0', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              Lihat semua <i className="ti ti-chevron-right" style={{ fontSize: '14px' }}></i>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', margin: '0 -20px', padding: '0 20px' }}>
            {ambianceImages.map((img, i) => (
              <div key={i} style={{ width: '120px', height: '120px', borderRadius: '16px', flexShrink: 0, overflow: 'hidden' }}>
                <img src={img} alt="Ambiance" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Location Card */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>
            <i className="ti ti-map-pin" style={{ color: '#0EA5A0', fontSize: '20px' }}></i> Lokasi
          </div>
          <div style={{ padding: '16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: 0, marginBottom: '8px' }}>
                {restaurant.address}
              </p>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0EA5A0', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                Buka di Maps <i className="ti ti-chevron-right" style={{ fontSize: '14px' }}></i>
              </div>
            </div>
            <div style={{ width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
              <img src="https://maps.googleapis.com/maps/api/staticmap?center=-6.8048,110.8405&zoom=15&size=200x150&scale=2&maptype=roadmap&markers=color:red%7C-6.8048,110.8405&key=YOUR_API_KEY_HERE" alt="Map Snippet" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.95)' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150?text=Map'; }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#0EA5A0' }}>
                <i className="ti ti-map-pin-filled" style={{ fontSize: '24px', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}></i>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Bottom CTA */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#0F766E', padding: '16px 24px 32px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F766E' }}>
            <i className="ti ti-calendar-event" style={{ fontSize: '20px' }}></i>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>
              {isSeatoFull ? '0 meja tersedia' : `${seatoAllocated - seatoOccupied} meja tersedia`}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
              Reservasi cepat & mudah
            </div>
          </div>
        </div>

        {isSeatoFull && isWalkinAvailable ? (
          <button 
            style={{ background: 'white', color: '#0F766E', border: 'none', padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
            onClick={() => setShowContactForm(true)}
          >
            Kontak Manual
          </button>
        ) : isSeatoFull && !isWalkinAvailable ? (
          <button 
            style={{ background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', border: 'none', padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'not-allowed' }} 
            disabled
          >
            Fully Booked
          </button>
        ) : (
          <button 
            style={{ background: '#0EA5A0', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
            onClick={() => onBooking(restaurant)}
          >
            Reservasi via SEATO
          </button>
        )}
      </div>

      {/* Contact Manual Modal */}
      {showContactForm && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', width: '100%', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', animation: 'slideUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#1E293B' }}>Reservasi Manual</h3>
              <div onClick={() => setShowContactForm(false)} style={{ width: '32px', height: '32px', background: '#F1F5F9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
                <i className="ti ti-x"></i>
              </div>
            </div>
            
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: '1.5' }}>
              Kuota reservasi melalui aplikasi SEATO saat ini penuh. Namun, restoran masih memiliki ketersediaan meja untuk Walk-in. Silakan hubungi restoran secara langsung untuk reservasi manual.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <button style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: 600, color: '#1E293B', cursor: 'pointer' }}>
                <div style={{ width: '36px', height: '36px', background: '#ECFDF5', color: '#10B981', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-brand-whatsapp" style={{ fontSize: '20px' }}></i>
                </div>
                Hubungi via WhatsApp
              </button>
              <button style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: 600, color: '#1E293B', cursor: 'pointer' }}>
                <div style={{ width: '36px', height: '36px', background: '#F1F5F9', color: '#0EA5A0', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-phone" style={{ fontSize: '20px' }}></i>
                </div>
                Telepon Restoran
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
