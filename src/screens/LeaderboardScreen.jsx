import React, { useState, useEffect } from 'react';

export default function LeaderboardScreen({ onBack, currentUser }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('global');

  useEffect(() => {
    fetch('/api/leaderboard?limit=10')
      .then(res => res.json())
      .then(data => {
        setLeaders(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="screen-content bg-gray-50 flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ background: '#1B3461', padding: '64px 20px 24px', color: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <i className="ti ti-arrow-left" onClick={onBack} style={{ fontSize: '24px', cursor: 'pointer' }}></i>
          <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Leaderboard</h1>
        </div>
        
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '4px' }}>
          <div 
            onClick={() => setTab('global')}
            style={{ flex: 1, textAlign: 'center', padding: '8px 0', fontSize: '13px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', background: tab === 'global' ? 'white' : 'transparent', color: tab === 'global' ? '#1B3461' : 'white' }}
          >
            Global
          </div>
          <div 
            onClick={() => setTab('friends')}
            style={{ flex: 1, textAlign: 'center', padding: '8px 0', fontSize: '13px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', background: tab === 'friends' ? 'white' : 'transparent', color: tab === 'friends' ? '#1B3461' : 'white' }}
          >
            Friends
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>Loading leaderboard...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leaders.map((user, index) => (
              <div 
                key={user.id} 
                onClick={() => onViewProfile && onViewProfile(user.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '16px', 
                  background: user.id === currentUser?.id ? '#F0FDFA' : 'white', 
                  borderRadius: '16px', border: user.id === currentUser?.id ? '1px solid #99F6E4' : '1px solid #F1F5F9',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ 
                  width: '24px', fontSize: '14px', fontWeight: 800, 
                  color: index === 0 ? '#F59E0B' : index === 1 ? '#94A3B8' : index === 2 ? '#B45309' : '#64748B',
                  textAlign: 'center'
                }}>
                  {index + 1}
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: '#E2E8F0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, margin: '0 12px' }}>
                  {user.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {user.name}
                    {user.id === currentUser?.id && <span style={{ fontSize: '10px', background: '#0EA5A0', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>You</span>}
                    {index < Math.ceil(leaders.length * 0.05) && <i className="ti ti-flame" style={{ color: '#EF4444', fontSize: '14px' }} title="Top 5%"></i>}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Level {user.level} {user.specialization && <span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{user.specialization}</span>}
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1B3461' }}>
                  {user.xpPoints.toLocaleString()} <span style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8' }}>XP</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}
