import React, { useState, useEffect } from 'react';
import ComposeStreamModal from '../components/ui/ComposeStreamModal';

export default function CommunityScreen({ currentUser, onViewProfile }) {
  const [tab, setTab] = useState('streams');
  const [reviews, setReviews] = useState([]);
  const [streams, setStreams] = useState([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  const fetchStreams = () => {
    fetch('/api/streams')
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setStreams(data); });
  };

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setReviews(data); });
      
    fetchStreams();
  }, []);

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
      <div style={{ padding: '64px 20px 16px', background: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 className="text-navy" style={{ fontSize: '24px', fontWeight: 800 }}>Komunitas</h1>
      </div>
      
      <div className="tabs-underline" style={{ background: 'white', position: 'sticky', top: '108px', zIndex: 10 }}>
        <div className={`tab-u ${tab === 'streams' ? 'active' : ''}`} onClick={() => setTab('streams')}>For You</div>
        <div className={`tab-u ${tab === 'following' ? 'active' : ''}`} onClick={() => setTab('following')}>Following</div>
        <div className={`tab-u ${tab === 'nearby' ? 'active' : ''}`} onClick={() => setTab('nearby')}>Nearby</div>
        <div className={`tab-u ${tab === 'trending' ? 'active' : ''}`} onClick={() => setTab('trending')}>Trending</div>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
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
    </div>
  );
}
