import React from 'react';

export default function BadgeCard({ badge, isLocked }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px 12px',
      background: isLocked ? '#F8FAFC' : 'white',
      borderRadius: '12px',
      border: '1px solid',
      borderColor: isLocked ? '#E2E8F0' : '#E2E8F0',
      opacity: isLocked ? 0.6 : 1,
      boxShadow: isLocked ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)',
      textAlign: 'center',
      minWidth: '100px',
      height: '100%',
      position: 'relative'
    }}>
      {isLocked && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          color: '#94A3B8'
        }}>
          <i className="ti ti-lock"></i>
        </div>
      )}
      <div style={{
        width: '48px',
        height: '48px',
        marginBottom: '12px',
        filter: isLocked ? 'grayscale(100%)' : 'none'
      }}>
        <img src={badge.iconUrl} alt={badge.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '4px', lineHeight: 1.2 }}>
        {badge.name}
      </div>
      {badge.earnedAt && !isLocked && (
        <div style={{ fontSize: '10px', color: '#64748B' }}>
          {new Date(badge.earnedAt).toLocaleDateString('id-ID')}
        </div>
      )}
    </div>
  );
}
