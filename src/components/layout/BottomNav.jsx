import React from 'react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', icon: 'ti-home', label: 'Home' },
    { id: 'promo', icon: 'ti-ticket', label: 'Promo' },
    { id: 'community', icon: 'ti-users', label: 'Community' },
    { id: 'reservasi', icon: 'ti-calendar-event', label: 'Reservasi' },
    { id: 'akun', icon: 'ti-user-circle', label: 'Profil' }
  ];

  return (
    <div className="bottom-nav-modern">
      {tabs.map((tab) => (
        <div 
          key={tab.id}
          className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`} 
          onClick={() => setActiveTab(tab.id)}
        >
          <i className={`ti ${tab.icon}`}></i>
          <span className="bottom-nav-label">{tab.label}</span>
        </div>
      ))}
    </div>
  );
}
