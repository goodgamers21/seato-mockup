"use client";
import React, { useState, useEffect } from 'react';
import { 
  IconSettings, IconMinus, IconPlus, IconArmchair, IconTrendingUp, 
  IconListNumbers, IconUsers, IconBell, IconCheck, IconTrash, IconMapPlus
} from '@tabler/icons-react';

export default function MyRestoProfile() {
  // --- STATE ---
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('Loading...');
  const [areas, setAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const partnerId = localStorage.getItem('partnerRestoId');
    if (!partnerId) {
      window.location.href = '/admin/login';
      return;
    }

    fetch('/api/restaurants')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const resto = data.find(r => r.id === partnerId);
          if (!resto) {
            window.location.href = '/admin/login';
            return;
          }

          setRestaurantId(resto.id);
          setRestaurantName(resto.name);
          if (resto.areas && resto.areas.length > 0) {
            setAreas(resto.areas);
          } else {
            // Default initialization if no areas exist yet in DB
            const initAreas = [
              { id: '1', name: 'Indoor Area', total: 12, seatoAllocated: 4, seatoOccupied: 0, walkInOccupied: 0 },
              { id: '2', name: 'Outdoor Area', total: 8, seatoAllocated: 2, seatoOccupied: 0, walkInOccupied: 0 }
            ];
            setAreas(initAreas);
            // Optionally sync defaults to backend immediately
            syncToBackend(resto.id, initAreas);
          }
        }
        setIsLoading(false);
      });
  }, []);

  const syncToBackend = (rId, areasData) => {
    fetch(`/api/restaurants/${rId}/areas`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ areas: areasData })
    }).catch(console.error);
  };

  // Edit Quota State
  const [isEditingQuota, setIsEditingQuota] = useState(false);
  const [editAreas, setEditAreas] = useState([]);

  // Waitlist Notification
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifSentTo, setNotifSentTo] = useState(null);

  // --- COMPUTED GLOBALS ---
  const totalTables = areas.reduce((sum, a) => sum + a.total, 0);
  const seatoOccupied = areas.reduce((sum, a) => sum + a.seatoOccupied, 0);
  const walkInOccupied = areas.reduce((sum, a) => sum + a.walkInOccupied, 0);
  const totalOccupied = seatoOccupied + walkInOccupied;
  const totalAvailable = totalTables - totalOccupied;

  const seatoAllocated = areas.reduce((sum, a) => sum + a.seatoAllocated, 0);
  const walkInAllocated = areas.reduce((sum, a) => sum + (a.total - a.seatoAllocated), 0);

  const pct = totalTables > 0 ? Math.round((totalOccupied / totalTables) * 100) : 0;
  const walkInPct = totalTables > 0 ? (walkInOccupied / totalTables) * 100 : 0;
  const seatoPct = totalTables > 0 ? (seatoOccupied / totalTables) * 100 : 0;

  let statusLabel = 'AVAILABLE';
  let statusColor = '#10B981'; // Green
  let statusBg = '#D1FAE5';
  if (pct >= 90) {
    statusLabel = 'FULL';
    statusColor = '#EF4444'; // Red
    statusBg = '#FEE2E2';
  } else if (pct >= 60) {
    statusLabel = 'BUSY';
    statusColor = '#F59E0B'; // Amber
    statusBg = '#FEF3C7';
  }

  // --- HANDLERS FOR AREAS ---
  const updateArea = (areaId, type, delta) => {
    setAreas(prevAreas => {
      const newAreas = prevAreas.map(a => {
        if (a.id !== areaId) return a;
        
        const newArea = { ...a };
        const currentOccupied = a.seatoOccupied + a.walkInOccupied;

        if (type === 'seato') {
          const newVal = a.seatoOccupied + delta;
          if (newVal >= 0 && newVal <= a.seatoAllocated && currentOccupied + delta <= a.total) {
            newArea.seatoOccupied = newVal;
          }
        } else if (type === 'walkin') {
          const newVal = a.walkInOccupied + delta;
          // allow overflowing into SEATO allocated quota
          if (newVal >= 0 && currentOccupied + delta <= a.total) {
            newArea.walkInOccupied = newVal;
          }
        }

        if (delta < 0) {
          setNotifyOpen(false);
        }

        return newArea;
      });

      if (restaurantId) {
        syncToBackend(restaurantId, newAreas);
      }
      
      return newAreas;
    });
  };

  // --- EDIT FORM HANDLERS ---
  const startEditing = () => {
    // Deep clone areas for editing
    setEditAreas(JSON.parse(JSON.stringify(areas)));
    setIsEditingQuota(true);
  };

  const handleEditAreaChange = (id, field, value) => {
    setEditAreas(prev => prev.map(a => {
      if (a.id !== id) return a;
      let newVal = value;
      // Validations
      if (field === 'seatoAllocated') {
        newVal = Math.max(0, Math.min(a.total, Number(value)));
      }
      if (field === 'total') {
        newVal = Math.max(1, Number(value));
        // Cap seatoAllocated without direct mutation
        const cappedSeato = Math.min(a.seatoAllocated, newVal);
        return { ...a, total: newVal, seatoAllocated: cappedSeato };
      }
      return { ...a, [field]: newVal };
    }));
  };

  const handleAddEditArea = () => {
    const newId = Date.now().toString();
    setEditAreas([...editAreas, { id: newId, name: 'Area Baru', total: 5, seatoAllocated: 2, seatoOccupied: 0, walkInOccupied: 0 }]);
  };

  const handleRemoveEditArea = (id) => {
    setEditAreas(prev => prev.filter(a => a.id !== id));
  };

  const handleSaveQuota = () => {
    // Merge new areas with existing occupancy if id matches, otherwise start at 0
    const finalAreas = editAreas.map(ea => {
      const existing = areas.find(a => a.id === ea.id);
      if (existing) {
        // Cap occupancy just in case total shrank
        const safeSeatoOcc = Math.min(existing.seatoOccupied, ea.seatoAllocated);
        const safeWalkOcc = Math.min(existing.walkInOccupied, ea.total - safeSeatoOcc);
        return { ...ea, seatoOccupied: safeSeatoOcc, walkInOccupied: safeWalkOcc };
      }
      return ea;
    });
    setAreas(finalAreas);
    setIsEditingQuota(false);
    
    if (restaurantId) {
      syncToBackend(restaurantId, finalAreas);
    }
  };

  // Waitlist Notification
  const handleNotify = (pax, name) => {
    setNotifyOpen(false);
    setNotifSentTo(name);
    setTimeout(() => {
      setNotifSentTo(null);
    }, 4000);
  };

  const waitlist = [
    { id: 1, name: 'Arif', pax: 4, waitTime: '5 mnt', status: 'waiting' },
    { id: 2, name: 'Budi', pax: 2, waitTime: '25 mnt', status: 'waiting' },
    { id: 3, name: 'Sarah', pax: 5, waitTime: '40 mnt', status: 'waiting' }
  ];

  // Auto open notify if available
  useEffect(() => {
    if (totalAvailable > 0 && !notifSentTo) {
      setNotifyOpen(true);
    } else {
      setNotifyOpen(false);
    }
  }, [totalAvailable, notifSentTo]);

  return (
    <div className="screen-content" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Header */}
      <div style={{ background: '#1E40AF', padding: '64px 20px 24px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>{restaurantName}</h1>
            <p style={{ fontSize: '12px', color: '#93C5FD', marginTop: '4px' }}>Dashboard Staff • Total {totalTables} Meja</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '20px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>
              RN
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Rani</span>
          </div>
        </div>

        {/* Master Occupancy Card */}
        <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#93C5FD', fontWeight: 600, marginBottom: '4px' }}>Meja Terisi Saat Ini</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1 }}>{totalOccupied}</span>
                <span style={{ fontSize: '16px', color: '#93C5FD', fontWeight: 600 }}>/ {totalTables}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#93C5FD', marginTop: '4px' }}>
                {totalAvailable <= 0 ? 'Semua meja terisi' : `${totalAvailable} meja kosong`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#93C5FD', fontWeight: 600, marginBottom: '4px' }}>Occupancy</div>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>{pct}%</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: statusBg, color: statusColor, marginTop: '8px' }}>
                {statusLabel}
              </div>
            </div>
          </div>

          {/* Dual Progress Bar */}
          <div style={{ height: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${walkInPct}%`, background: '#F59E0B', transition: 'width 0.4s ease' }} title={`Walk-in: ${walkInOccupied}`} />
            <div style={{ width: `${seatoPct}%`, background: '#3B82F6', transition: 'width 0.4s ease' }} title={`SEATO: ${seatoOccupied}`} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
            <span>Walk-in: {walkInOccupied}</span>
            <span>SEATO: {seatoOccupied}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '-10px' }}>
        
        {/* Allocation Manager (Quota Split) */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Alokasi Total
            </h2>
            {!isEditingQuota && (
              <button 
                onClick={startEditing} 
                style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Kelola Area
              </button>
            )}
          </div>
          
          {isEditingQuota ? (
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>Kelola daftar area, jumlah meja, dan kuota untuk aplikasi SEATO.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
                {editAreas.map((ea, idx) => (
                  <div key={ea.id} style={{ background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <input 
                        type="text" 
                        value={ea.name} 
                        onChange={(e) => handleEditAreaChange(ea.id, 'name', e.target.value)}
                        style={{ fontSize: '13px', fontWeight: 700, border: 'none', borderBottom: '1px solid #CBD5E1', outline: 'none', color: '#0F172A', width: '60%' }} 
                      />
                      <button onClick={() => handleRemoveEditArea(ea.id)} style={{ background: 'none', border: 'none', color: '#EF4444' }}>
                        <IconTrash size={16} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Total Meja</label>
                        <input type="number" value={ea.total} onChange={(e) => handleEditAreaChange(ea.id, 'total', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Kuota SEATO</label>
                        <input type="number" value={ea.seatoAllocated} onChange={(e) => handleEditAreaChange(ea.id, 'seatoAllocated', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleAddEditArea} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px dashed #94A3B8', background: 'transparent', color: '#475569', fontSize: '13px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}>
                <IconMapPlus size={16} /> Tambah Area Baru
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setIsEditingQuota(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
                <button onClick={handleSaveQuota} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#3B82F6', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Simpan Area</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 600, marginBottom: '4px' }}>TOTAL WALK-IN</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#B45309' }}>{walkInAllocated}</div>
              </div>
              <div style={{ flex: 1, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 600, marginBottom: '4px' }}>TOTAL SEATO</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#1D4ED8' }}>{seatoAllocated}</div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Multi-Area Denah Meja */}
        <div>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Zonasi Area Meja
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {areas.map((area) => {
              const areaOccupied = area.seatoOccupied + area.walkInOccupied;
              const areaWalkInQuota = area.total - area.seatoAllocated;
              
              return (
                <div key={area.id} style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>{area.name}</h3>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Total: {area.total} Meja • SEATO: {area.seatoAllocated} • Walk-in: {areaWalkInQuota}</div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: areaOccupied >= area.total ? '#EF4444' : '#10B981' }}>
                      {areaOccupied}/{area.total} Terisi
                    </div>
                  </div>

                  {/* Grid Meja */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
                    {Array.from({ length: area.total }).map((_, i) => {
                      // Zone-based rendering: SEATO zone (0 to seatoAllocated-1), then Walk-in zone
                      const isSeatoZone = i < area.seatoAllocated;
                      let isSeato = false;
                      let isWalkIn = false;
                      let isOverflowWalkin = false;

                      if (isSeatoZone) {
                        // SEATO zone: first seatoOccupied slots are filled SEATO
                        isSeato = i < area.seatoOccupied;
                        // Check if walk-in overflowed into SEATO zone
                        if (!isSeato) {
                          const overflowCount = Math.max(0, area.walkInOccupied - areaWalkInQuota);
                          if (overflowCount > 0) {
                            const emptyInSeatoZone = area.seatoAllocated - area.seatoOccupied;
                            const overflowInSeatoZone = Math.min(overflowCount, emptyInSeatoZone);
                            isOverflowWalkin = (i - area.seatoOccupied) < overflowInSeatoZone;
                            isWalkIn = isOverflowWalkin;
                          }
                        }
                      } else {
                        // Walk-in zone: fill from left of this zone
                        const walkInZoneIndex = i - area.seatoAllocated;
                        const normalWalkIn = Math.min(area.walkInOccupied, areaWalkInQuota);
                        isWalkIn = walkInZoneIndex < normalWalkIn;
                      }
                      let isEmpty = !isSeato && !isWalkIn;

                      return (
                        <div key={i} style={{ 
                          aspectRatio: '1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isSeato ? '#DBEAFE' : isWalkIn ? (isOverflowWalkin ? '#F1F5F9' : '#FEF3C7') : '#F1F5F9',
                          border: `1px solid ${isSeato ? '#93C5FD' : isWalkIn ? (isOverflowWalkin ? '#94A3B8' : '#FDE68A') : '#E2E8F0'}`,
                          color: isSeato ? '#1D4ED8' : isWalkIn ? (isOverflowWalkin ? '#475569' : '#B45309') : '#94A3B8',
                          transition: 'all 0.2s ease',
                          boxShadow: !isEmpty ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                        }}>
                          {isEmpty ? (
                            <span style={{ fontSize: '11px', fontWeight: 700 }}>{i+1}</span>
                          ) : (
                            <IconArmchair size={18} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Area Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#F8FAFC', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => updateArea(area.id, 'walkin', -1)}
                        disabled={area.walkInOccupied === 0}
                        style={{ flex: 1, border: '1px solid #FDE68A', borderRadius: '8px', padding: '8px', fontSize: '11px', fontWeight: 600, background: 'white', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: area.walkInOccupied === 0 ? 0.4 : 1 }}
                      >
                        <IconMinus size={14} /> Walk-in
                      </button>
                      <button 
                        onClick={() => updateArea(area.id, 'walkin', 1)}
                        disabled={areaOccupied >= area.total}
                        style={{ flex: 1, border: 'none', borderRadius: '8px', padding: '8px', fontSize: '11px', fontWeight: 700, background: '#F59E0B', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: (areaOccupied >= area.total) ? 0.4 : 1 }}
                      >
                        <IconPlus size={14} /> Walk-in
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => updateArea(area.id, 'seato', -1)}
                        disabled={area.seatoOccupied === 0}
                        style={{ flex: 1, border: '1px solid #BFDBFE', borderRadius: '8px', padding: '8px', fontSize: '11px', fontWeight: 600, background: 'white', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: area.seatoOccupied === 0 ? 0.4 : 1 }}
                      >
                        <IconMinus size={14} /> SEATO
                      </button>
                      <button 
                        onClick={() => updateArea(area.id, 'seato', 1)}
                        disabled={areaOccupied >= area.total || area.seatoOccupied >= area.seatoAllocated}
                        style={{ flex: 1, border: 'none', borderRadius: '8px', padding: '8px', fontSize: '11px', fontWeight: 700, background: '#3B82F6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: (areaOccupied >= area.total || area.seatoOccupied >= area.seatoAllocated) ? 0.4 : 1 }}
                      >
                        <IconPlus size={14} /> SEATO
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#F1F5F9' }} /> Kosong
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#FEF3C7' }} /> Walk-in
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#DBEAFE' }} /> SEATO
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#F1F5F9', border: '1px solid #94A3B8' }} /> SEATO dioverride ke Walk-in
            </div>
          </div>
        </div>

        {/* Notif Sent Success */}
        {notifSentTo && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <IconCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#065F46' }}>Notifikasi terkirim ke {notifSentTo}</div>
              <div style={{ fontSize: '12px', color: '#059669', marginTop: '2px' }}>Menunggu konfirmasi — berlaku 15 menit.</div>
            </div>
          </div>
        )}

        {/* Notify Panel Triggered when available */}
        {notifyOpen && !notifSentTo && (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
            <div style={{ background: '#FEF3C7', padding: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #FDE68A' }}>
              <IconBell size={20} color="#D97706" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#92400E', margin: 0 }}>Panggil Antrean Berikutnya!</h3>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>Meja kosong tersedia, notif antrean untuk berapa orang?</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[2, 4, 6, 8].map(pax => (
                  <button 
                    key={pax}
                    onClick={() => handleNotify(pax, waitlist[0].name)}
                    style={{ flex: '1 1 40%', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: '13px', fontWeight: 600 }}
                  >
                    {pax} Orang
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Waitlist List */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconListNumbers size={20} color="#3B82F6" />
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Daftar Waitlist</h2>
              <span style={{ background: '#EFF6FF', color: '#1E40AF', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{waitlist.length}</span>
            </div>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Est. 20 mnt</span>
          </div>

          <div>
            {waitlist.map((item, index) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: '1px solid #F8FAFC', background: notifSentTo === item.name ? '#FFFBEB' : 'white' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: notifSentTo === item.name ? '#2563EB' : '#EFF6FF', color: notifSentTo === item.name ? 'white' : '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    <IconUsers size={14} /> {item.pax} orang • Menunggu {item.waitTime}
                  </div>
                </div>
                <div>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: notifSentTo === item.name ? '#FEF3C7' : '#F1F5F9', color: notifSentTo === item.name ? '#92400E' : '#64748B' }}>
                    {notifSentTo === item.name ? 'Dinotif' : 'Menunggu'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
