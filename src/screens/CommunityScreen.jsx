import React, { useState, useEffect } from 'react';
import ComposeStreamModal from '../components/ui/ComposeStreamModal';
import AjukanEventModal from '../components/ui/AjukanEventModal';
import DaftarKomunitasModal from '../components/ui/DaftarKomunitasModal';

export default function CommunityScreen({ currentUser, onViewProfile }) {
  const [tab, setTab] = useState('events'); // Default or active tab
  const [reviews, setReviews] = useState([]);
  const [streams, setStreams] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [myVerifiedCommunities, setMyVerifiedCommunities] = useState([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isAjukanEventOpen, setIsAjukanEventOpen] = useState(false);
  const [isDaftarKomunitasOpen, setIsDaftarKomunitasOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [rsvpLoadingId, setRsvpLoadingId] = useState(null);

  const fetchEvents = () => {
    setLoadingEvents(true);
    fetch('/api/community/events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(console.error)
      .finally(() => setLoadingEvents(false));
  };

  const fetchMyCommunities = () => {
    if (!currentUser?.id) return;
    fetch('/api/community?status=VERIFIED')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const my = data.filter(c => c.picUserId === currentUser.id);
          setMyVerifiedCommunities(my);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setReviews(data); });
      
    fetchStreams();
    fetchEvents();
    fetchMyCommunities();
  }, [currentUser]);

  const handleRsvpToggle = async (event) => {
    if (!currentUser?.id) return;
    const isJoined = event.rsvps?.some(r => r.userId === currentUser.id && r.status === 'JOINED');
    setRsvpLoadingId(event.id);

    try {
      if (isJoined) {
        await fetch(`/api/community/events/${event.id}/rsvp?userId=${currentUser.id}`, {
          method: 'DELETE'
        });
      } else {
        await fetch(`/api/community/events/${event.id}/rsvp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id })
        });
      }
      fetchEvents();
    } catch (err) {
      console.error('Error toggling RSVP:', err);
    } finally {
      setRsvpLoadingId(null);
    }
  };

  const handleComposeSubmit = async ({ content, restaurantId, parentId }) => {
    try {
      await fetch('/api/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          content,
          restaurantId,
          parentId
        })
      });
      setIsComposeOpen(false);
      setReplyTo(null);
      fetchStreams(); // Refresh feed
    } catch(e) {
      console.error(e);
    }
  };

  const handleReplyClick = (stream) => {
    setReplyTo(stream);
    setIsComposeOpen(true);
  };

  return (
    <div className="screen-content bg-gray-50 flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '64px 20px 16px', background: 'white', position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="text-navy" style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Komunitas</h1>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0' }}>Ruang kumpul & jadwal titik temu cafe</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {myVerifiedCommunities.length > 0 && (
            <button
              onClick={() => setIsAjukanEventOpen(true)}
              style={{
                background: '#1B3461',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <span>+</span> Ajukan Event
            </button>
          )}
          <button
            onClick={() => setIsDaftarKomunitasOpen(true)}
            style={{
              background: '#F1F5F9',
              color: '#334155',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '8px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Daftar Komunitas
          </button>
        </div>
      </div>
      
      <div className="tabs-underline" style={{ background: 'white', position: 'sticky', top: '108px', zIndex: 10 }}>
        <div className={`tab-u ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>Events</div>
        <div className={`tab-u ${tab === 'streams' ? 'active' : ''}`} onClick={() => setTab('streams')}>For You</div>
        <div className={`tab-u ${tab === 'following' ? 'active' : ''}`} onClick={() => setTab('following')}>Following</div>
        <div className={`tab-u ${tab === 'nearby' ? 'active' : ''}`} onClick={() => setTab('nearby')}>Nearby</div>
        <div className={`tab-u ${tab === 'trending' ? 'active' : ''}`} onClick={() => setTab('trending')}>Trending</div>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        {tab === 'events' && (
          <div className="flex-col gap-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Jadwal Kumpul Komunitas</h2>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>Titik kumpul & nongkrong terkurasi di cafe mitra Seato</p>
              </div>
              <button onClick={fetchEvents} style={{ background: 'none', border: 'none', color: '#1B3461', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Refresh
              </button>
            </div>

            {loadingEvents && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0' }}>
                {[1, 2].map(i => (
                  <div key={i} className="card" style={{ padding: '16px', borderRadius: '16px', height: '140px', background: '#F1F5F9', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            )}

            {!loadingEvents && events.length === 0 && (
              <div className="card" style={{ padding: '36px 20px', borderRadius: '20px', textAlign: 'center', background: 'white' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>☕🏃</div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>Belum Ada Event Aktif</h3>
                <p style={{ fontSize: '12px', color: '#64748B', maxWidth: '280px', margin: '0 auto 16px' }}>
                  Komunitas Anda rutin lari, gowes, atau main boardgame? Jadwalkan titik temu cafe sekarang!
                </p>
                {myVerifiedCommunities.length > 0 ? (
                  <button
                    onClick={() => setIsAjukanEventOpen(true)}
                    style={{ background: '#1B3461', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Ajukan Event Pertama
                  </button>
                ) : (
                  <button
                    onClick={() => setIsDaftarKomunitasOpen(true)}
                    style={{ background: '#1B3461', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Daftarkan Komunitas Anda
                  </button>
                )}
              </div>
            )}

            {!loadingEvents && events.map(evt => {
              const isJoined = evt.rsvps?.some(r => r.userId === currentUser?.id && r.status === 'JOINED');
              const percent = Math.min(100, Math.round((evt.currentRsvp / evt.targetCapacity) * 100));
              const slotsLeft = Math.max(0, evt.targetCapacity - evt.currentRsvp);
              const isFull = slotsLeft <= 0;
              const isHighDemand = slotsLeft <= Math.ceil(evt.targetCapacity * 0.3) && !isFull;

              return (
                <div key={evt.id} className="card" style={{ padding: '18px', borderRadius: '20px', background: 'white', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Top Bar: Community + Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden', background: '#E2E8F0', flexShrink: 0 }}>
                        <img src={evt.community?.logoUrl || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=100'} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{evt.community?.name}</span>
                          {evt.community?.verificationStatus === 'VERIFIED' && (
                            <span style={{ fontSize: '11px', color: '#2563EB' }} title="Verified Community">✓</span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{evt.activityType} • {evt.eventType === 'TERSTRUKTUR' ? '🏆 Terstruktur' : '🏃 Santai'}</div>
                      </div>
                    </div>
                    {evt.status === 'LIVE' ? (
                      <span style={{ background: '#DC2626', color: 'white', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '8px', letterSpacing: '0.5px' }}>
                        ● SEDANG LIVE
                      </span>
                    ) : (
                      <span style={{ background: '#F1F5F9', color: '#475569', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '8px' }}>
                        {evt.date}
                      </span>
                    )}
                  </div>

                  {/* Title & Venue */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>{evt.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#334155' }}>
                      <span style={{ color: '#E11D48' }}>📍</span>
                      <strong style={{ fontWeight: 700 }}>{evt.restaurant?.name}</strong>
                      <span style={{ color: '#94A3B8' }}>•</span>
                      <span style={{ color: '#64748B' }}>{evt.time}</span>
                    </div>
                  </div>

                  {/* Merchant Reply Bubble (if exists) */}
                  {evt.merchantReply && (
                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 12px', borderRadius: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '14px' }}>☕</span>
                      <div style={{ fontSize: '12px', color: '#166534', lineHeight: 1.4 }}>
                        <strong style={{ fontWeight: 700, display: 'block', color: '#14532D' }}>Balasan dari {evt.restaurant?.name}:</strong>
                        "{evt.merchantReply}"
                      </div>
                    </div>
                  )}

                  {/* Request Chips */}
                  {Array.isArray(evt.requestChips) && evt.requestChips.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {evt.requestChips.map(ch => (
                        <span key={ch} style={{ fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '8px', background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' }}>
                          ✓ {ch.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Momentum Bar */}
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '14px', border: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
                          {evt.currentRsvp} / {evt.targetCapacity} Slot
                        </span>
                        {isHighDemand && (
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626', background: '#FEE2E2', padding: '2px 6px', borderRadius: '6px' }}>
                            🔥 Sisa {slotsLeft} slot!
                          </span>
                        )}
                        {isFull && (
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', background: '#E2E8F0', padding: '2px 6px', borderRadius: '6px' }}>
                            Kuota Penuh
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', fontVariantNumeric: 'tabular-nums' }}>
                        {percent}%
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: '#E2E8F0', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          borderRadius: '4px',
                          background: isFull ? '#94A3B8' : isHighDemand ? 'linear-gradient(90deg, #F59E0B, #DC2626)' : 'linear-gradient(90deg, #3B82F6, #1B3461)',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Button: Gabung / Batal */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                    <button
                      onClick={() => handleRsvpToggle(evt)}
                      disabled={rsvpLoadingId === evt.id || (!isJoined && isFull)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '12px',
                        border: isJoined ? '1px solid #E2E8F0' : 'none',
                        background: isJoined ? '#F8FAFC' : isFull ? '#E2E8F0' : '#1B3461',
                        color: isJoined ? '#64748B' : isFull ? '#94A3B8' : 'white',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: (rsvpLoadingId === evt.id || (!isJoined && isFull)) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {rsvpLoadingId === evt.id ? (
                        'Memproses...'
                      ) : isJoined ? (
                        '✓ Terdaftar (Batal Ikut)'
                      ) : isFull ? (
                        'Slot Penuh'
                      ) : (
                        '+ Gabung Run & Chill'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="flex-col gap-4">
            {reviews.map(rev => (
              <div key={rev.id} className="card" style={{ padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '16px', background: '#1B3461', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
                      {rev.user?.initials || 'U'}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{rev.user?.name || 'User'}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>di {rev.restaurant?.name || 'Restoran'}</div>
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
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '12px', textAlign: 'right' }}>
                  {new Date(rev.createdAt).toLocaleDateString('id-ID')}
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <p style={{ textAlign: 'center', color: '#94A3B8', padding: '40px 0' }}>Belum ada ulasan.</p>
            )}
          </div>
        )}

        {tab === 'streams' && (
          <div className="flex-col gap-4">
            {streams.map(stream => (
              <div key={stream.id} className="card" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div 
                      onClick={() => { if (stream.authorId && onViewProfile) onViewProfile(stream.authorId); }}
                      style={{ width: '36px', height: '36px', borderRadius: '18px', background: stream.type === 'RESTO_PROMO' ? '#0EA5A0' : (stream.type === 'USER_POST' ? '#3B82F6' : '#F59E0B'), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, cursor: stream.authorId ? 'pointer' : 'default' }}>
                      {stream.authorAvatar || stream.authorName.charAt(0)}
                    </div>
                    <div>
                      <div 
                        onClick={() => { if (stream.authorId && onViewProfile) onViewProfile(stream.authorId); }}
                        style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', cursor: stream.authorId ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        {stream.authorName}
                        {stream.authorLevel && <span style={{ background: '#F1F5F9', color: '#475569', fontSize: '10px', padding: '2px 6px', borderRadius: '8px', fontWeight: 800 }}>Lv {stream.authorLevel}</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {stream.type === 'RESTO_PROMO' ? 'Pengumuman Restoran' : stream.type === 'USER_POST' ? 'Postingan Pengguna' : 'Ulasan Pengguna'} • {new Date(stream.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5', margin: '0 0 12px 0' }}>
                    {stream.content}
                  </p>

                  {/* Show tagged restaurant if it's a USER_POST with a tag */}
                  {stream.restaurant && stream.type === 'USER_POST' && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#F0FDFA', color: '#0EA5A0', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>
                      <i className="ti ti-building-store"></i> @{stream.restaurant.name}
                    </div>
                  )}
                </div>
                
                {stream.imageUrl && (
                  <div style={{ width: '100%', height: '180px', backgroundImage: `url(${stream.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                )}
                
                <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '13px', cursor: 'pointer' }}>
                    <i className="ti ti-thumb-up"></i> {stream.likes} Suka
                  </div>
                  <div onClick={() => handleReplyClick(stream)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '13px', cursor: 'pointer' }}>
                    <i className="ti ti-message-circle"></i> Balas {stream.replies?.length > 0 && `(${stream.replies.length})`}
                  </div>
                </div>

                {/* Render Replies */}
                {stream.replies && stream.replies.length > 0 && (
                  <div style={{ background: '#F8FAFC', borderTop: '1px solid #F1F5F9', padding: '12px 16px' }}>
                    {stream.replies.map(reply => (
                      <div key={reply.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px', borderLeft: '2px solid #E2E8F0', paddingLeft: '12px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '14px', background: '#3B82F6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                          {reply.authorAvatar || reply.authorName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{reply.authorName}</span>
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>{new Date(reply.createdAt).toLocaleDateString('id-ID')}</span>
                          </div>
                          <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.4', margin: '4px 0 0 0' }}>
                            {reply.content}
                          </p>
                          {reply.restaurant && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#F0FDFA', color: '#0EA5A0', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>
                              <i className="ti ti-building-store"></i> @{reply.restaurant.name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {streams.length === 0 && (
              <p style={{ textAlign: 'center', color: '#94A3B8', padding: '40px 0' }}>Belum ada aktivitas di Streams.</p>
            )}
          </div>
        )}

        {tab === 'trending' && (
          <div className="flex-col gap-4">
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Trending Minggu Ini 🔥</h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>Restoran yang paling banyak dibicarakan di komunitas.</p>
            
            <div className="card" style={{ padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#F59E0B', width: '24px', textAlign: 'center' }}>1</div>
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#E2E8F0', overflow: 'hidden', flexShrink: 0 }}>
                <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=150&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Cafe" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#0F172A' }}>Kopi Kenangan Senopati</h3>
                <div style={{ fontSize: '12px', color: '#64748B' }}>142 mentions minggu ini</div>
              </div>
            </div>
            
            <div className="card" style={{ padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#94A3B8', width: '24px', textAlign: 'center' }}>2</div>
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#E2E8F0', overflow: 'hidden', flexShrink: 0 }}>
                <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=150&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Cafe" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#0F172A' }}>Anomali Coffee Menteng</h3>
                <div style={{ fontSize: '12px', color: '#64748B' }}>89 mentions minggu ini</div>
              </div>
            </div>
            
            <div className="card" style={{ padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#B45309', width: '24px', textAlign: 'center' }}>3</div>
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#E2E8F0', overflow: 'hidden', flexShrink: 0 }}>
                <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Cafe" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#0F172A' }}>% Arabica Roastery</h3>
                <div style={{ fontSize: '12px', color: '#64748B' }}>64 mentions minggu ini</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button for Tweeting (Only in Streams Tab) */}
      {tab === 'streams' && currentUser && (
        <button 
          onClick={() => { setReplyTo(null); setIsComposeOpen(true); }}
          style={{ position: 'absolute', bottom: '96px', right: '24px', width: '56px', height: '56px', borderRadius: '28px', background: '#1B3461', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(27,52,97,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }}
        >
          <i className="ti ti-pencil" style={{ fontSize: '24px' }}></i>
        </button>
      )}

      {isComposeOpen && (
        <ComposeStreamModal 
          onClose={() => { setIsComposeOpen(false); setReplyTo(null); }}
          onSubmit={handleComposeSubmit}
          replyTo={replyTo}
        />
      )}

      {isAjukanEventOpen && currentUser && (
        <AjukanEventModal
          currentUser={currentUser}
          onClose={() => setIsAjukanEventOpen(false)}
          onSuccess={() => {
            fetchEvents();
            setTab('events');
          }}
        />
      )}

      {isDaftarKomunitasOpen && currentUser && (
        <DaftarKomunitasModal
          currentUser={currentUser}
          onClose={() => setIsDaftarKomunitasOpen(false)}
          onSuccess={() => {
            fetchMyCommunities();
            alert('Komunitas Anda berhasil didaftarkan! Menunggu verifikasi dari tim kurasi Seato Ops.');
          }}
        />
      )}
    </div>
  );
}
