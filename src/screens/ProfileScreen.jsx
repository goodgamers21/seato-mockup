import React, { useState, useEffect } from 'react';
import BadgeCard from '../components/ui/BadgeCard';
import LevelProgressBar from '../components/ui/LevelProgressBar';

export default function ProfileScreen({ currentUser, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      // Fetch full profile with badges and XP logs
      fetch(`/api/profile/${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          return fetch('/api/badges'); // Fetch all available badges
        })
        .then(res => res.json())
        .then(data => {
          setAllBadges(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [currentUser]);

  if (loading || !profile) return <div className="screen-content" style={{ padding: '20px' }}>Loading Profile...</div>;
  if (profile.error) return <div className="screen-content" style={{ padding: '20px', color: 'red' }}>Error: {profile.error}</div>;

  const earnedBadgeIds = (profile.badges || []).map(b => b.badgeId);
  const displayBadges = allBadges.map(badge => ({
    ...badge,
    earnedAt: (profile.badges || []).find(b => b.badgeId === badge.id)?.earnedAt,
    isLocked: !earnedBadgeIds.includes(badge.id)
  }));

  const levelBadges = displayBadges.filter(b => b.category === 'LEVEL');
  const specialistBadges = displayBadges.filter(b => b.category === 'SPECIALIST' || b.category === 'ACHIEVEMENT');

  return (
    <div className="screen-content bg-gray-50 flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <div style={{ background: '#1B3461', color: 'white', padding: '40px 20px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '12px' }}>
          <button onClick={() => onNavigate('leaderboard')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '18px', cursor: 'pointer' }}>
            <i className="ti ti-trophy"></i>
          </button>
          <button onClick={() => onNavigate('settings')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '18px', cursor: 'pointer' }}>
            <i className="ti ti-settings"></i>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

        {/* PROGRESS BAR */}
        <div style={{ marginBottom: '24px' }}>
          <LevelProgressBar xp={profile.xpPoints} level={profile.level} />
        </div>

        {/* BADGES */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>My Badges</h2>
            <span style={{ fontSize: '12px', color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}>See All</span>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }} className="hide-scrollbar">
            {specialistBadges.map(badge => (
              <BadgeCard key={badge.id} badge={badge} isLocked={badge.isLocked} />
            ))}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>Recent Activity</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(profile.xpLogs || []).length > 0 ? (profile.xpLogs || []).map(log => (
              <div key={log.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '18px', background: '#F0FDFA', color: '#0EA5A0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={log.action === 'REVIEW' ? 'ti ti-star' : 'ti ti-map-pin'}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#334155' }}>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{profile.name}</span> {' '}
                    {log.action === 'REVIEW' ? 'menulis ulasan' : 'baru saja check-in'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                    {new Date(log.createdAt).toLocaleDateString('id-ID')}
                  </div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B' }}>
                  +{log.xpAmount} XP
                </div>
              </div>
            )) : (
               <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>Belum ada aktivitas.</p>
            )}
          </div>
        </div>
        
        {/* QUICK LINKS */}
        <div style={{ marginTop: '32px' }}>
          <h2 className="text-muted" style={{ marginBottom: '12px', fontSize: '13px' }}>Aktivitas Saya</h2>
          <div className="menu-list" style={{ background: 'white', borderRadius: '16px' }}>
            <div className="menu-item"><i className="ti ti-calendar"></i> <span className="text-navy" style={{ fontWeight: 600, flex: 1 }}>Riwayat Reservasi</span> <i className="ti ti-chevron-right text-muted"></i></div>
            <div className="menu-item"><i className="ti ti-heart"></i> <span className="text-navy" style={{ fontWeight: 600, flex: 1 }}>Restoran Favorit</span> <i className="ti ti-chevron-right text-muted"></i></div>
            <div className="menu-item"><i className="ti ti-star"></i> <span className="text-navy" style={{ fontWeight: 600, flex: 1 }}>Ulasan Saya</span> <i className="ti ti-chevron-right text-muted"></i></div>
          </div>
        </div>

      </div>
    </div>
  );
}
