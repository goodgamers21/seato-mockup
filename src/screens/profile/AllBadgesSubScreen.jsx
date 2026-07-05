import React, { useState } from 'react';
import BadgeCard from '../../components/ui/BadgeCard';

export default function AllBadgesSubScreen({ badges = [], earnedBadgeIds = [], onBack }) {
  const [selectedBadge, setSelectedBadge] = useState(null);

  const displayBadges = badges.map(badge => ({
    ...badge,
    isLocked: !earnedBadgeIds.includes(badge.id)
  }));

  const specialistBadges = displayBadges.filter(b => b.category === 'SPECIALIST');
  const achievementBadges = displayBadges.filter(b => b.category === 'ACHIEVEMENT');
  const levelBadges = displayBadges.filter(b => b.category === 'LEVEL');

  const renderBadgeGrid = (badgeList, title) => {
    if (badgeList.length === 0) return null;
    return (
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>{title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {badgeList.map(badge => (
            <div key={badge.id} onClick={() => setSelectedBadge(badge)} style={{ cursor: 'pointer' }}>
              <BadgeCard badge={badge} isLocked={badge.isLocked} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="screen-content bg-gray-50 flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', padding: '64px 20px 16px', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <i className="ti ti-arrow-left" onClick={onBack} style={{ fontSize: '24px', cursor: 'pointer' }}></i>
          <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Semua Badge</h1>
        </div>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        {renderBadgeGrid(specialistBadges, 'Niche Specialist')}
        {renderBadgeGrid(achievementBadges, 'Achievements')}
        {renderBadgeGrid(levelBadges, 'Level Badges')}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '20px' }}>
          <div style={{ background: 'white', width: '100%', borderRadius: '24px', padding: '24px', animation: 'scaleUp 0.3s ease', position: 'relative', textAlign: 'center' }}>
            <div onClick={() => setSelectedBadge(null)} style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', background: '#F1F5F9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
              <i className="ti ti-x"></i>
            </div>
            
            <div style={{ width: '96px', height: '96px', margin: '0 auto 16px', filter: selectedBadge.isLocked ? 'grayscale(100%)' : 'none', opacity: selectedBadge.isLocked ? 0.6 : 1 }}>
              <img src={selectedBadge.iconUrl} alt={selectedBadge.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>{selectedBadge.name}</h3>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.5', margin: '0 0 24px 0' }}>{selectedBadge.description}</p>
            
            <div style={{ background: selectedBadge.isLocked ? '#F8FAFC' : '#F0FDFA', borderRadius: '12px', padding: '16px', border: `1px solid ${selectedBadge.isLocked ? '#E2E8F0' : '#99F6E4'}` }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: selectedBadge.isLocked ? '#64748B' : '#0EA5A0', marginBottom: '4px' }}>
                STATUS
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: selectedBadge.isLocked ? '#475569' : '#0F766E' }}>
                {selectedBadge.isLocked ? 'Belum Didapatkan' : `Didapatkan pada ${new Date(selectedBadge.earnedAt).toLocaleDateString('id-ID')}`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
