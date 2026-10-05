"use client";
import React, { useState, useEffect } from 'react';
import { IconCheck, IconX, IconRefresh, IconCalendar, IconUsers, IconClock, IconMessageDots } from '@tabler/icons-react';

export default function AdminCommunityPage() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restaurantId, setRestaurantId] = useState('');
  const [actionModal, setActionModal] = useState(null); // { event, action: 'APPROVE' | 'REJECT' }
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let rId = localStorage.getItem('partnerRestoId');
    if (!rId) {
      // Fallback: fetch first subscribed/available resto
      fetch('/api/restaurants')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setRestaurantId(data[0].id);
            fetchRequests(data[0].id);
          }
        })
        .catch(console.error);
    } else {
      setRestaurantId(rId);
      fetchRequests(rId);
    }
  }, []);

  const fetchRequests = (rId = restaurantId) => {
    if (!rId) return;
    setLoading(true);

    // Fetch pending
    fetch(`/api/admin/community/requests?restaurantId=${rId}&status=PENDING`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPendingRequests(data);
      })
      .catch(console.error);

    // Fetch approved/live
    fetch(`/api/admin/community/requests?restaurantId=${rId}&status=ALL`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setApprovedEvents(data.filter(e => ['APPROVED', 'LIVE', 'COMPLETED'].includes(e.status)));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleOpenAction = (event, action) => {
    setActionModal({ event, action });
    setReplyText('');
  };

  const handleSubmitAction = async () => {
    if (!actionModal) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/community/requests/${actionModal.event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionModal.action,
          reply: replyText.trim(),
          restaurantId
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Gagal memproses permintaan');
      } else {
        setActionModal(null);
        fetchRequests();
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan jaringan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Komunitas & Event Titik Temu</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>Kelola ajuan jadwal kumpul komunitas di venue restoran Anda</p>
        </div>
        <button
          onClick={() => fetchRequests()}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', color: '#334155', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
        >
          <IconRefresh size={16} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'pending' ? '#1B3461' : 'transparent',
            color: activeTab === 'pending' ? 'white' : '#64748B',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>Ajuan Masuk</span>
          {pendingRequests.length > 0 && (
            <span style={{ background: activeTab === 'pending' ? '#EF4444' : '#E2E8F0', color: activeTab === 'pending' ? 'white' : '#0F172A', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'approved' ? '#1B3461' : 'transparent',
            color: activeTab === 'approved' ? 'white' : '#64748B',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>Event Disetujui</span>
          <span style={{ background: activeTab === 'approved' ? 'rgba(255,255,255,0.2)' : '#F1F5F9', color: activeTab === 'approved' ? 'white' : '#64748B', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
            {approvedEvents.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Memuat data ajuan...</div>
      ) : activeTab === 'pending' ? (
        pendingRequests.length === 0 ? (
          <div style={{ background: 'white', padding: '48px 24px', borderRadius: '16px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>☕🎉</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Tidak Ada Ajuan Pending</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>Semua permintaan jadwal event komunitas telah Anda tanggapi.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {pendingRequests.map(req => (
              <div key={req.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden', background: '#F1F5F9' }}>
                      <img src={req.community?.logoUrl || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=100'} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{req.community?.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>PIC: {req.submittedBy?.name || 'PIC'} ({req.submittedBy?.email})</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '8px', background: req.eventType === 'TERSTRUKTUR' ? '#FEF3C7' : '#EFF6FF', color: req.eventType === 'TERSTRUKTUR' ? '#B45309' : '#1D4ED8' }}>
                    {req.eventType}
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>{req.title}</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconCalendar size={14} color="#64748B" /> {req.date}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconClock size={14} color="#64748B" /> {req.time}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconUsers size={14} color="#64748B" /> Target {req.targetCapacity} Orang
                    </div>
                  </div>
                </div>

                {/* Chips */}
                {Array.isArray(req.requestChips) && req.requestChips.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {req.requestChips.map(ch => (
                      <span key={ch} style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#475569' }}>
                        ✓ {ch.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}

                {req.customNote && (
                  <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '10px', fontSize: '12px', color: '#475569', fontStyle: 'italic' }}>
                    "{req.customNote}"
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    onClick={() => handleOpenAction(req, 'REJECT')}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <IconX size={16} /> Tolak
                  </button>
                  <button
                    onClick={() => handleOpenAction(req, 'APPROVE')}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#0EA5A0', color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <IconCheck size={16} /> Setujui
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Approved Tab */
        approvedEvents.length === 0 ? (
          <div style={{ background: 'white', padding: '48px 24px', borderRadius: '16px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Belum Ada Event Disetujui</h3>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700 }}>
                  <th style={{ padding: '14px 20px' }}>Komunitas</th>
                  <th style={{ padding: '14px 20px' }}>Event</th>
                  <th style={{ padding: '14px 20px' }}>Jadwal</th>
                  <th style={{ padding: '14px 20px' }}>Slot / Kuota</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Balasan Anda</th>
                </tr>
              </thead>
              <tbody>
                {approvedEvents.map(evt => (
                  <tr key={evt.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0F172A' }}>
                      {evt.community?.name}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#334155' }}>
                      {evt.title}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748B' }}>
                      {evt.date} • {evt.time}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
                      {evt.currentRsvp} / {evt.targetCapacity}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: evt.status === 'LIVE' ? '#FEE2E2' : '#DCFCE7', color: evt.status === 'LIVE' ? '#DC2626' : '#15803D' }}>
                        {evt.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '12px' }}>
                      {evt.merchantReply ? `"${evt.merchantReply}"` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Action Modal (Approve / Reject + Reply 1x) */}
      {actionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              {actionModal.action === 'APPROVE' ? 'Setujui Ajuan Event' : 'Tolak Ajuan Event'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' }}>
              {actionModal.event.title} — {actionModal.event.community?.name}
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Balasan Singkat ke Komunitas (Maks. 140 Karakter)
              </label>
              <textarea
                placeholder={actionModal.action === 'APPROVE' ? 'Contoh: Siap kami siapkan meja outdoor depan dan welcome drinks!' : 'Contoh: Maaf, slot jam tersebut sudah penuh reservasi internal.'}
                value={replyText}
                maxLength={140}
                onChange={(e) => setReplyText(e.target.value)}
                style={{ width: '100%', height: '80px', padding: '10px 12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '13px', resize: 'none' }}
              />
              <div style={{ textAlign: 'right', fontSize: '11px', color: '#94A3B8', marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
                {replyText.length} / 140
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setActionModal(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', fontWeight: 700, cursor: 'pointer' }}
              >
                Batal
              </button>
              <button
                onClick={handleSubmitAction}
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: actionModal.action === 'APPROVE' ? '#0EA5A0' : '#DC2626',
                  color: 'white',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Menyimpan...' : actionModal.action === 'APPROVE' ? 'Konfirmasi Setujui' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
