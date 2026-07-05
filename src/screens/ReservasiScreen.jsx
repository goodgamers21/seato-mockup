import React, { useState, useEffect } from 'react';
import InvoiceModal from '../components/ui/InvoiceModal';
import CancelModal from '../components/ui/CancelModal';
import ReviewModal from '../components/ui/ReviewModal';
import toast from 'react-hot-toast';

export default function ReservasiScreen({ navigateToExplore, currentUser }) {
  const [resTab, setResTab] = useState('upcoming');
  const [reservations, setReservations] = useState({ upcoming: [], selesai: [], dibatalkan: [] });
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const [selectedResForReview, setSelectedResForReview] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const [userStats, setUserStats] = useState({ isBanned: false, cancelCount: 0 });

  const fetchReservations = () => {
    if (!currentUser) return;
    fetch(`/api/reservations?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.upcoming)) {
          setReservations(data);
          setUserStats({ isBanned: data.isBanned || false, cancelCount: data.cancelCount || 0 });
        }
      });
  };

  useEffect(() => {
    fetchReservations();
  }, [currentUser]);

  const openCancel = (id) => {
    setCancelTargetId(id);
    setIsCancelOpen(true);
  };

  const handleCancelConfirm = async (reason) => {
    try {
      await fetch(`/api/reservations/${cancelTargetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Dibatalkan', cancelReason: reason, cancelledBy: 'user' })
      });
      setIsCancelOpen(false);
      setCancelTargetId(null);
      fetchReservations();
    } catch(e) {
      console.error(e);
    }
  };

  const openInvoice = (res) => {
    setSelectedInvoice(res);
    setIsInvoiceOpen(true);
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          restaurantId: selectedResForReview.restaurantId,
          reservationId: selectedResForReview.id,
          rating,
          comment
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error('Gagal mengirim ulasan: ' + (data.error || 'Unknown error'));
        return;
      }

      setIsReviewOpen(false);
      setSelectedResForReview(null);
      toast.success(
        <div>
          Terima kasih atas ulasan Anda! <br/>
          <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>+10 XP points</span>
        </div>,
        { duration: 4000 }
      );
    } catch(e) {
      console.error(e);
      toast.error('Gagal mengirim ulasan (Network Error)');
    }
  };

  return (
    <div className="screen-content" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '64px 20px 16px', background: 'white' }}>
        <h1 className="text-navy">Reservasi Saya</h1>
      </div>
      <div className="tabs-underline">
        <div className={`tab-u ${resTab === 'upcoming' ? 'active' : ''}`} onClick={() => setResTab('upcoming')}>Upcoming</div>
        <div className={`tab-u ${resTab === 'selesai' ? 'active' : ''}`} onClick={() => setResTab('selesai')}>Selesai</div>
        <div className={`tab-u ${resTab === 'dibatalkan' ? 'active' : ''}`} onClick={() => setResTab('dibatalkan')}>Dibatalkan</div>
      </div>
      
      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        {resTab === 'upcoming' && (
          <div className="flex-col gap-4">
            {reservations.upcoming.map(res => (
              <div key={res.id} className="card" style={{ borderLeft: `3px solid ${res.status === 'Confirmed' ? '#0EA5A0' : '#F59E0B'}` }}>
                <div className="flex-row justify-between" style={{ marginBottom: '12px' }}>
                  <h2 className="text-navy">{res.restaurantName}</h2>
                  <span className={`chip ${res.status === 'Confirmed' ? 'chip-confirmed' : 'chip-waiting'}`}>{res.status}</span>
                </div>
                <div className="flex-col gap-2" style={{ marginBottom: '16px' }}>
                  {res.location && <p className="caption text-muted">{res.location}</p>}
                  <p className="text-muted flex-row gap-2"><i className="ti ti-calendar"></i> {res.date} • {res.time}</p>
                  <p className="text-muted flex-row gap-2"><i className="ti ti-users"></i> {res.guests} orang • {res.tableType}</p>
                </div>
                <div className="flex-row gap-3">
                  <button className="btn-outline-navy" style={{ flex: 1 }} onClick={() => openInvoice(res)}>Lihat Detail</button>
                  <button className="btn-outline-red" style={{ flex: 1 }} onClick={() => openCancel(res.id)}>Batalkan</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {resTab === 'selesai' && (
          <div className="flex-col gap-4">
            {reservations.selesai.map(res => (
              <div key={res.id} className="card" style={{ opacity: 0.8 }}>
                <div className="flex-row justify-between" style={{ marginBottom: '12px' }}>
                  <h2 className="text-navy">{res.restaurantName}</h2>
                  <span className="chip" style={{ background: '#E2E8F0', color: '#64748B' }}>{res.status}</span>
                </div>
                <div className="flex-col gap-2" style={{ marginBottom: '16px' }}>
                  <p className="text-muted flex-row gap-2"><i className="ti ti-calendar"></i> {res.date} • {res.time}</p>
                </div>
                <div className="flex-row gap-3">
                  <button className="btn-outline-navy" style={{ flex: 1 }} onClick={() => openInvoice(res)}>Lihat Invoice</button>
                  <button className="btn-outline-teal" style={{ flex: 1 }} onClick={() => { setSelectedResForReview(res); setIsReviewOpen(true); }}>Beri Ulasan</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {resTab === 'dibatalkan' && (
          <div className="flex-col gap-4">
            {reservations.dibatalkan.map(res => (
              <div key={res.id} className="card" style={{ borderLeft: `3px solid ${res.status === 'Ditolak Restoran' ? '#F59E0B' : '#E11D48'}`, opacity: 0.8 }}>
                <div className="flex-row justify-between" style={{ marginBottom: '12px' }}>
                  <h2 className="text-navy">{res.restaurantName}</h2>
                  <span className="chip" style={{ 
                    background: res.status === 'Ditolak Restoran' ? '#FEF3C7' : '#FEE2E2', 
                    color: res.status === 'Ditolak Restoran' ? '#92400E' : '#BE123C' 
                  }}>{res.status}</span>
                </div>
                <div className="flex-col gap-2">
                  <p className="text-muted flex-row gap-2"><i className="ti ti-calendar"></i> {res.date} • {res.time}</p>
                  {res.cancelReason && <p className="caption text-muted flex-row gap-2" style={{ color: res.status === 'Ditolak Restoran' ? '#92400E' : '#E11D48' }}><i className="ti ti-info-circle"></i> Alasan: {res.cancelReason}</p>}
                  {res.cancelledBy && (
                    <p className="caption text-muted flex-row gap-2" style={{ color: '#64748B' }}>
                      <i className="ti ti-user"></i> Dibatalkan oleh: {res.cancelledBy === 'user' ? 'Anda' : res.cancelledBy === 'admin' ? 'Restoran' : 'Sistem (Otomatis)'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '20px', background: 'white', borderTop: '0.5px solid #E2E8F0' }}>
        <button className="btn-cta" onClick={navigateToExplore}>Buat Reservasi Baru</button>
      </div>

      {isInvoiceOpen && <InvoiceModal invoice={selectedInvoice} onClose={() => setIsInvoiceOpen(false)} />}
      
      {isCancelOpen && (
        <CancelModal 
          onClose={() => setIsCancelOpen(false)} 
          onConfirm={handleCancelConfirm}
          cancelCount={userStats.cancelCount}
        />
      )}

      {isReviewOpen && (
        <ReviewModal 
          reservation={selectedResForReview}
          onClose={() => setIsReviewOpen(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
