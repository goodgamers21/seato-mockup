import React from 'react';

export default function LevelProgressBar({ xp, level }) {
  const LEVEL_THRESHOLDS = [
    { level: 1, xp: 0, title: 'Newcomer' },
    { level: 5, xp: 500, title: 'Explorer' },
    { level: 10, xp: 2000, title: 'Enthusiast' },
    { level: 15, xp: 5000, title: 'Connoisseur' },
    { level: 20, xp: 10000, title: 'Master Hopper' },
    { level: 25, xp: 20000, title: 'Legend Hopper' },
  ];

  let currentThreshold = LEVEL_THRESHOLDS[0];
  let nextThreshold = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      currentThreshold = LEVEL_THRESHOLDS[i];
      nextThreshold = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i];
    }
  }

  // Calculate progress percentage to next milestone
  let progress = 100;
  let xpNeeded = 0;
  if (currentThreshold.level !== nextThreshold.level) {
    const range = nextThreshold.xp - currentThreshold.xp;
    const currentProgress = xp - currentThreshold.xp;
    progress = Math.max(0, Math.min(100, (currentProgress / range) * 100));
    xpNeeded = nextThreshold.xp - xp;
  }

  return (
    <div style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '2px' }}>
            Level {level}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
            {currentThreshold.title}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '2px' }}>
            XP Points
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
            {xp.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
        <div style={{ 
          height: '100%', 
          width: `${progress}%`, 
          background: 'linear-gradient(90deg, #F59E0B 0%, #FCD34D 100%)',
          borderRadius: '4px',
          transition: 'width 0.5s ease-out'
        }}></div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{currentThreshold.xp.toLocaleString()} XP</span>
        {xpNeeded > 0 ? (
          <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 600 }}>{xpNeeded.toLocaleString()} XP to {nextThreshold.title}</span>
        ) : (
          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Max Level Reached</span>
        )}
        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{nextThreshold.xp.toLocaleString()} XP</span>
      </div>
    </div>
  );
}
