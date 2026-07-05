import React, { useState, useEffect } from 'react';
import BadgeCard from '../components/ui/BadgeCard';

export default function PublicProfileScreen({ userId, currentUser, onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetch(`/api/profile/${userId}`)
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [userId]);

  if (loading || !profile) return <div className="screen-content" style={{ padding: '20px' }}>Loading Profile...</div>;
  if (profile.error) return <div className="screen-content" style={{ padding: '20px', color: 'red' }}>Error: {profile.error}</div>;

  const earnedBadges = (profile.badges || []).map(b => b.badge);

  return (
    <div className="screen-content bg-gray-50 flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <div style={{ background: '#1B3461', color: 'white', padding: '40px 20px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10 }}>
          <i className="ti ti-arrow-left" onClick={onBack} style={{ fontSize: '24px', cursor: 'pointer' }}></i>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '32px', background: 'white', color: '#1B3461', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800 }}>
            {profile.initials}
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {profile.name} <i className="ti ti-discount-check-filled" style={{ color: '#0EA5A0', fontSize: '18px' }}></i>
            </h1>
            <p style={{ fontSize: '13px', opacity: 0.9, margin: 0 }}>Level {profile.level} {profile.specialization ? `• ${profile.specialization}` : ''}</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        
        {/* STATS SUMMARY */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{profile.cafesVisited}</div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Cafes Visited</div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{profile.statsUlasan}</div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Reviews</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{(profile.xpPoints / 1000).toFixed(1)}K</div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>XP Points</div>
          </div>
        </div>

        {/* BADGES */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Badges</h2>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }} className="hide-scrollbar">
            {earnedBadges.length > 0 ? earnedBadges.map(badge => (
              <BadgeCard key={badge.id} badge={badge} isLocked={false} />
            )) : (
              <div style={{ fontSize: '13px', color: '#94A3B8' }}>Belum ada badge yang didapat.</div>
            )}
          </div>
        </div>

        {/* RECENT REVIEWS */}
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>Recent Reviews</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(profile.reviews || []).slice(0, 3).length > 0 ? (profile.reviews || []).slice(0, 3).map(rev => (
              <div key={rev.id} className="card" style={{ padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
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
            )) : (
               <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>Belum ada ulasan.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
