"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconChartBar, IconCalendarEvent, IconArmchair, IconDiscount2, IconSettings, IconLogout, IconUsers } from '@tabler/icons-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard BI', path: '/admin', icon: IconChartBar },
    { id: 'reservasi', label: 'Reservations', path: '/admin/reservations', icon: IconCalendarEvent },
    { id: 'community', label: 'Komunitas & Event', path: '/admin/community', icon: IconUsers },
    { id: 'resto', label: 'Zonasi Meja', path: '/admin/restaurants', icon: IconArmchair },
    { id: 'promo', label: 'Promos', path: '/admin/promos', icon: IconDiscount2 }
  ];

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      background: 'white',
      borderRight: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      position: 'sticky',
      top: 0
    }}>
      {/* Logo Area */}
      <div style={{ padding: '0 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '32px', height: '32px', background: '#1B3461', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '18px' }}>
          S
        </div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
          Seato <span style={{ color: '#0EA5A0' }}>Business</span>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px', flex: 1 }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>
          Menu Utama
        </div>
        
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || (tab.path !== '/admin' && pathname.startsWith(tab.path));
          const Icon = tab.icon;
          
          return (
            <Link href={tab.path} key={tab.id} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: isActive ? '#F1F5F9' : 'transparent',
                color: isActive ? '#0EA5A0' : '#64748B',
                fontWeight: isActive ? 700 : 600,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}>
                <Icon size={20} color={isActive ? '#0EA5A0' : '#94A3B8'} />
                <span style={{ fontSize: '14px' }}>{tab.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Area */}
      <div style={{ padding: '0 16px', borderTop: '1px solid #F1F5F9', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#64748B', fontWeight: 600, cursor: 'pointer', borderRadius: '12px' }}>
          <IconSettings size={20} color="#94A3B8" />
          <span style={{ fontSize: '14px' }}>Settings</span>
        </div>
        <Link href="/admin/login" style={{ textDecoration: 'none' }}>
          <div onClick={() => localStorage.removeItem('partnerRestoId')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#EF4444', fontWeight: 600, cursor: 'pointer', borderRadius: '12px' }}>
            <IconLogout size={20} color="#EF4444" />
            <span style={{ fontSize: '14px' }}>Logout</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
