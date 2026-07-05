import React, { useEffect, useState } from 'react';

export default function XPNotification({ xp, action, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500); // Allow animation to finish
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'absolute',
      top: '80px',
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '-50px'}) scale(${visible ? 1 : 0.8})`,
      opacity: visible ? 1 : 0,
      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      background: 'linear-gradient(135deg, #1B3461 0%, #0F172A 100%)',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '32px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.25), 0 0 20px rgba(245, 158, 11, 0.2)',
      zIndex: 1000,
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ 
        width: '40px', height: '40px', borderRadius: '20px', 
        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(245, 158, 11, 0.4)',
        animation: visible ? 'spin 1s ease-out' : 'none'
      }}>
        <i className="ti ti-star-filled" style={{ fontSize: '20px' }}></i>
      </div>
      <div>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#FCD34D', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>+{xp} XP Earned!</div>
        <div style={{ fontSize: '12px', color: '#CBD5E1', opacity: 0.9, marginTop: '2px' }}>{action}</div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(-180deg) scale(0.5); }
          100% { transform: rotate(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

