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

  // Fetch fresh area data from server (single source of truth)
  const fetchAreas = async (rId) => {
    try {
      const res = await fetch(`/api/restaurants/${rId}/areas`);
      const data = await res.json();
      if (data.success && Array.isArray(data.areas)) {
        setAreas(data.areas);
      }
    } catch (err) {
      console.error('Failed to fetch areas:', err);
    }
  };

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
          // Always use areas from DB — no hardcoded fallback
          if (resto.areas && resto.areas.length > 0) {
            setAreas(resto.areas);
          }
          // If no areas exist, areas stays [] and user can add via "Kelola Area"
        }
        setIsLoading(false);
      });
  }, []);

  // Sync area config (quota editing) to backend and update state from response
  const syncAreasConfig = async (rId, areasData) => {
    try {
      const res = await fetch(`/api/restaurants/${rId}/areas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areas: areasData })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.areas)) {
        setAreas(data.areas); // Sync state from server response
      }
    } catch (err) {
      console.error('Failed to sync areas config:', err);
    }
  };

  // Atomic update: PATCH a single area's seatoOccupied or walkInOccupied
  const patchAreaOccupancy = async (rId, areaId, field, delta) => {
    try {
      const res = await fetch(`/api/restaurants/${rId}/areas`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areaId, field, delta })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.areas)) {
        setAreas(data.areas); // Sync entire areas state from server
      } else {
        // If server rejected, re-fetch to correct frontend state
        await fetchAreas(rId);
      }
    } catch (err) {
      console.error('Failed to patch area occupancy:', err);
      // Re-fetch to ensure consistency
      await fetchAreas(rId);
    }
  };

  // Edit Quota State
  const [isEditingQuota, setIsEditingQuota] = useState(false);
  const [editAreas, setEditAreas] = useState([]);

  // Waitlist Notification
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifSentTo, setNotifSentTo] = useState(null);

  // --- INTERACTIVE TABLE STATE ---
  const [tableAssignments, setTableAssignments] = useState([]);
  const [pendingAssignTable, setPendingAssignTable] = useState(null);
  const [tableReminder, setTableReminder] = useState(null); // { id, areaName, tableNumber, type }

  // 10-second timer for testing (in real app, this would be 5 minutes = 300000ms)
  const TIMER_DURATION_MS = 10000; 

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const expired = tableAssignments.find(w => !w.notified && w.type === 'walkin' && (now - w.assignedAt) > TIMER_DURATION_MS);
      
      if (expired) {
        setTableAssignments(prev => prev.map(w => w.id === expired.id ? { ...w, notified: true } : w));
        const area = areas.find(a => a.id === expired.areaId);
        setTableReminder({ id: expired.id, areaName: area?.name || '', tableNumber: expired.tableIndex + 1, type: expired.type });
      }
    }, 2000); // Check every 2 seconds
    return () => clearInterval(interval);
  }, [tableAssignments, areas]);

  const confirmAssign = () => {
    if (pendingAssignTable) {
      const { areaId, tableIndex, type } = pendingAssignTable;
      updateArea(areaId, type, 1);
      setTableAssignments(prev => [
        ...prev, 
        { 
          id: Math.random().toString(36).substr(2, 9),
          areaId, 
          tableIndex,
          type,
          assignedAt: Date.now(),
          notified: false
        }
      ]);
      setPendingAssignTable(null);
    }
  };

  const finishTableAssignment = (assignmentId) => {
    const assignment = tableAssignments.find(w => w.id === assignmentId);
    if (assignment) {
      updateArea(assignment.areaId, assignment.type, -1);
      setTableAssignments(prev => prev.filter(w => w.id !== assignmentId));
    }
    if (tableReminder && tableReminder.id === assignmentId) {
      setTableReminder(null);
    }
  };

  const resetTimer = (assignmentId) => {
    setTableAssignments(prev => prev.map(w => w.id === assignmentId ? { ...w, notified: false, assignedAt: Date.now() } : w));
    setTableReminder(null);
  };


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
    // Optimistic update for instant UI feedback
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
          if (newVal >= 0 && currentOccupied + delta <= a.total) {
            newArea.walkInOccupied = newVal;
          }
        }

        if (delta < 0) {
          setNotifyOpen(false);
        }

        return newArea;
      });
      return newAreas;
    });

    // Atomic PATCH to server — server response will be the true state
    if (restaurantId) {
      const field = type === 'seato' ? 'seatoOccupied' : 'walkInOccupied';
      patchAreaOccupancy(restaurantId, areaId, field, delta);
    }
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
    const newId = crypto.randomUUID();
    setEditAreas([...editAreas, { id: newId, name: 'Area Baru', total: 5, seatoAllocated: 2, seatoOccupied: 0, walkInOccupied: 0 }]);
  };

  const handleRemoveEditArea = (id) => {
    setEditAreas(prev => prev.filter(a => a.id !== id));
  };

  const handleSaveQuota = async () => {
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
    setIsEditingQuota(false);
    
    if (restaurantId) {
      // Await server response and use that as the source of truth
      await syncAreasConfig(restaurantId, finalAreas);
    } else {
      setAreas(finalAreas);
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
      <div style={{ width: '100%', background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '32px 48px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, zIndex: 30 }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>{restaurantName}</h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Dashboard Staff • Total {totalTables} Meja</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F1F5F9', padding: '6px 16px 6px 6px', borderRadius: '30px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1B3461', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
            RN
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>Rani</span>
        </div>
      </div>

      <div style={{ padding: '32px 48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Master Occupancy Card - Redesigned to match BI Theme */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meja Terisi Saat Ini</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '40px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{totalOccupied}</span>
                <span style={{ fontSize: '16px', color: '#94A3B8', fontWeight: 600 }}>/ {totalTables}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '8px' }}>
                {totalAvailable <= 0 ? 'Semua meja terisi' : `${totalAvailable} meja kosong`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tingkat Okupansi</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#1E40AF' }}>{pct}%</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: statusBg, color: statusColor, marginTop: '8px' }}>
                {statusLabel}
              </div>
            </div>
          </div>

          {/* Dual Progress Bar */}
          <div style={{ height: '12px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${walkInPct}%`, background: '#F59E0B', transition: 'width 0.4s ease' }} title={`Walk-in: ${walkInOccupied}`} />
            <div style={{ width: `${seatoPct}%`, background: '#3B82F6', transition: 'width 0.4s ease' }} title={`SEATO: ${seatoOccupied}`} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ color: '#B45309' }}>Walk-in: {walkInOccupied} Meja</span>
            <span style={{ color: '#1D4ED8' }}>SEATO: {seatoOccupied} Meja</span>
          </div>
        </div>
        
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Zonasi Area Meja
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div 
                draggable 
                onDragStart={(e) => { e.dataTransfer.setData('type', 'walkin') }}
                style={{ background: '#FEF3C7', color: '#B45309', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: '1px solid #FDE68A', cursor: 'grab', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <IconArmchair size={16} /> Drag Tamu Walk-in
              </div>
              <div 
                draggable 
                onDragStart={(e) => { e.dataTransfer.setData('type', 'seato') }}
                style={{ background: '#DBEAFE', color: '#1D4ED8', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: '1px solid #93C5FD', cursor: 'grab', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <IconArmchair size={16} /> Drag Tamu SEATO
              </div>
            </div>
          </div>

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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                    {Array.from({ length: area.total }).map((_, i) => {
                      // Check explicit assignments
                      const assignment = tableAssignments.find(w => w.areaId === area.id && w.tableIndex === i);
                      
                      let isSeato = assignment?.type === 'seato';
                      let isWalkIn = assignment?.type === 'walkin';
                      let isEmpty = !isSeato && !isWalkIn;
                      
                      // Identify SEATO zone styling hint
                      const isSeatoZone = i < area.seatoAllocated;

                      return (
                        <div 
                          key={i}
                          onDragOver={(e) => {
                            if (isEmpty) {
                              e.preventDefault(); // allow drop
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (isEmpty) {
                              const type = e.dataTransfer.getData('type');
                              if (type === 'seato' || type === 'walkin') {
                                setPendingAssignTable({ areaId: area.id, tableIndex: i, areaName: area.name, type });
                              }
                            }
                          }}
                          style={{ 
                          position: 'relative',
                          aspectRatio: '1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isSeato ? '#DBEAFE' : isWalkIn ? '#FEF3C7' : '#F1F5F9',
                          border: `1px solid ${isSeato ? '#93C5FD' : isWalkIn ? '#FDE68A' : isSeatoZone ? '#CBD5E1' : '#E2E8F0'}`,
                          borderStyle: isEmpty && isSeatoZone ? 'dashed' : 'solid',
                          color: isSeato ? '#1D4ED8' : isWalkIn ? '#B45309' : '#94A3B8',
                          transition: 'all 0.2s ease',
                          boxShadow: !isEmpty ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                        }}>
                          {/* Close X Button if Assigned */}
                          {!isEmpty && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if(confirm(`Selesaikan sesi ${isSeato ? 'SEATO' : 'Walk-in'} untuk Meja ${i+1}?`)) {
                                  finishTableAssignment(assignment.id);
                                }
                              }}
                              style={{
                                position: 'absolute', top: '4px', right: '4px',
                                background: isSeato ? '#93C5FD' : '#FDE68A',
                                color: isSeato ? '#1E3A8A' : '#92400E',
                                border: 'none', borderRadius: '50%', width: '16px', height: '16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', padding: 0
                              }}
                            >
                              <IconMinus size={12} />
                            </button>
                          )}

                          {isEmpty ? (
                            <span style={{ fontSize: '11px', fontWeight: 700 }}>{i+1}</span>
                          ) : (
                            <IconArmchair size={18} />
                          )}
                        </div>
                      );
                    })}
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



      </div>
      </div>

      {/* Pending Assign Confirm Modal */}
      {pendingAssignTable && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '360px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: pendingAssignTable.type === 'seato' ? '#DBEAFE' : '#FEF3C7', color: pendingAssignTable.type === 'seato' ? '#1D4ED8' : '#D97706', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <IconUsers size={24} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0F172A' }}>Assign {pendingAssignTable.type === 'seato' ? 'SEATO' : 'Walk-in'}</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B', lineHeight: '1.5' }}>
              Masukkan tamu {pendingAssignTable.type === 'seato' ? 'SEATO' : 'Walk-in'} ke <strong>Meja {pendingAssignTable.tableIndex + 1}</strong> di <strong>{pendingAssignTable.areaName}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setPendingAssignTable(null)} style={{ flex: 1, padding: '12px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
              <button onClick={confirmAssign} style={{ flex: 1, padding: '12px', background: pendingAssignTable.type === 'seato' ? '#3B82F6' : '#F59E0B', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Ya, Assign</button>
            </div>
          </div>
        </div>
      )}

      {/* Timer Reminder Notification */}
      {tableReminder && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'white', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', zIndex: 200, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#FEF2F2', color: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconBell size={20} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Pengingat Meja {tableReminder.type === 'seato' ? 'SEATO' : 'Walk-in'}!</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Tamu di <strong>{tableReminder.areaName} - Meja {tableReminder.tableNumber}</strong> sudah cukup lama. Apakah mereka masih di sana?</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => resetTimer(tableReminder.id)} style={{ flex: 1, padding: '10px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Masih (Reset)</button>
            <button onClick={() => finishTableAssignment(tableReminder.id)} style={{ flex: 1, padding: '10px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Sudah Selesai</button>
          </div>
        </div>
      )}
    </div>
  );
}
