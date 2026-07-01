import React, { useEffect, useState } from 'react';

export default function XPNotification({ xp, action, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Allow animation to finish
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'absolute',
      bottom: '100px',
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '20px'})`,
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      background: '#0F172A',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      zIndex: 1000
    }}>
      <div style={{ 
        width: '32px', height: '32px', borderRadius: '16px', 
        background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <i className="ti ti-star-filled" style={{ fontSize: '16px' }}></i>
      </div>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 700 }}>+{xp} XP Earned!</div>
        <div style={{ fontSize: '11px', color: '#94A3B8', opacity: 0.9 }}>{action}</div>
      </div>
    </div>
  );
}
