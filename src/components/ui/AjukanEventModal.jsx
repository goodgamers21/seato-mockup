import React, { useState, useEffect } from 'react';

export default function AjukanEventModal({ currentUser, onClose, onSuccess }) {
  const [communities, setCommunities] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [title, setTitle] = useState('');
  const [activityType, setActivityType] = useState('RUNNING');
  const [eventType, setEventType] = useState('SANTAI'); // SANTAI (H-3) | TERSTRUKTUR (H-7)
  const [date, setDate] = useState('');
  const [time, setTime] = useState('06:00 - 08:30');
  const [targetCapacity, setTargetCapacity] = useState(25);
  const [selectedChips, setSelectedChips] = useState(['DISCOUNT_GROUP', 'RESERVE_AREA']);
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const CHIP_OPTIONS = [
    { id: 'DISCOUNT_GROUP', label: 'Diskon Grup' },
    { id: 'REFRESHMENT', label: 'Free Refreshment / Air Mineral' },
    { id: 'RESERVE_AREA', label: 'Reserve Area Khusus' },
    { id: 'BANNER', label: 'Izin Pasang Banner' },
    { id: 'DOCS', label: 'Izin Dokumentasi Kamera' },
    { id: 'OTHER', label: 'Kebutuhan Lainnya' },
  ];

  useEffect(() => {
    // 1. Fetch communities where currentUser is PIC and verified
    fetch('/api/community?status=VERIFIED')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const myVerified = data.filter(c => c.picUserId === currentUser?.id);
          setCommunities(myVerified);
          if (myVerified.length > 0) {
            setSelectedCommunityId(myVerified[0].id);
            setActivityType(myVerified[0].category || 'RUNNING');
          }
        }
      })
      .catch(console.error);

    // 2. Fetch restaurants list for venue dropdown
    fetch('/api/restaurants')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRestaurants(data);
          if (data.length > 0) setSelectedRestaurantId(data[0].id);
        }
      })
      .catch(console.error);

    // Default min date calculation (H-3 for SANTAI)
    calculateMinDate('SANTAI');
  }, [currentUser]);

  const calculateMinDate = (type) => {
    const minDays = type === 'TERSTRUKTUR' ? 7 : 3;
    const d = new Date();
    d.setDate(d.getDate() + minDays);
    const minDateStr = d.toISOString().split('T')[0];
    setDate(minDateStr);
  };

  const handleEventTypeChange = (newType) => {
    setEventType(newType);
    calculateMinDate(newType);
  };

  const toggleChip = (chipId) => {
    if (selectedChips.includes(chipId)) {
      setSelectedChips(selectedChips.filter(c => c !== chipId));
    } else {
      setSelectedChips([...selectedChips, chipId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedCommunityId) {
      setErrorMsg('Pilih komunitas Anda terlebih dahulu.');
      return;
    }
    if (!selectedRestaurantId) {
      setErrorMsg('Pilih venue tujuan.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Judul event tidak boleh kosong.');
      return;
    }

    // Client-side lead time check
    const minDays = eventType === 'TERSTRUKTUR' ? 7 : 3;
    const now = new Date();
    const chosenDate = new Date(`${date}T00:00:00+07:00`);
    const diffDays = Math.ceil((chosenDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < minDays) {
      setErrorMsg(`Event ${eventType} membutuhkan pengajuan minimal H-${minDays}. Silakan pilih tanggal setelahnya.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/community/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityId: selectedCommunityId,
          restaurantId: selectedRestaurantId,
          submittedById: currentUser.id,
          title: title.trim(),
          activityType,
          eventType,
          date,
          time,
          targetCapacity: parseInt(targetCapacity, 10) || 25,
          requestChips: selectedChips,
          customNote: customNote.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengajukan event');
      }

      onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDateLimit = () => {
    const minDays = eventType === 'TERSTRUKTUR' ? 7 : 3;
    const d = new Date();
    d.setDate(d.getDate() + minDays);
    return d.toISOString().split('T')[0];
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'white', padding: '24px', borderRadius: '24px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Ajukan Event Komunitas</h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>Request venue & kesepakatan titik temu</p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
            ✕
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Pilih Komunitas */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Komunitas Anda (PIC)</label>
            <select
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '14px', background: '#F8FAFC' }}
            >
              {communities.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.category})</option>
              ))}
            </select>
          </div>

          {/* Pilih Venue */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Pilih Venue Resto / Cafe</label>
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '14px', background: '#F8FAFC' }}
            >
              {restaurants.map(r => (
                <option key={r.id} value={r.id}>{r.name} - {r.city}</option>
              ))}
            </select>
          </div>

          {/* Judul Event */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Judul Event</label>
            <input
              type="text"
              placeholder="Contoh: Saturday Morning 5K & Coffee"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '14px' }}
            />
          </div>

          {/* Tipe Event (Lead Time Guardrail) */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Jenis Format & Lead Time</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleEventTypeChange('SANTAI')}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  border: `2px solid ${eventType === 'SANTAI' ? '#1B3461' : '#E2E8F0'}`,
                  background: eventType === 'SANTAI' ? '#EFF6FF' : 'white',
                  color: eventType === 'SANTAI' ? '#1B3461' : '#64748B',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div>🏃 Santai (Min H-3)</div>
                <div style={{ fontSize: '10px', fontWeight: 400, marginTop: '2px', color: '#64748B' }}>Nongkrong/Finish Point</div>
              </button>
              <button
                type="button"
                onClick={() => handleEventTypeChange('TERSTRUKTUR')}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  border: `2px solid ${eventType === 'TERSTRUKTUR' ? '#1B3461' : '#E2E8F0'}`,
                  background: eventType === 'TERSTRUKTUR' ? '#EFF6FF' : 'white',
                  color: eventType === 'TERSTRUKTUR' ? '#1B3461' : '#64748B',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div>🏆 Terstruktur (Min H-7)</div>
                <div style={{ fontSize: '10px', fontWeight: 400, marginTop: '2px', color: '#64748B' }}>Kebutuhan banner/area</div>
              </button>
            </div>
          </div>

          {/* Tanggal & Jam */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Tanggal</label>
              <input
                type="date"
                min={minDateLimit()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: '100%', padding: '10px 8px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Jam</label>
              <input
                type="text"
                placeholder="06:00 - 08:30"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ width: '100%', padding: '10px 10px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Target Kapasitas */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Estimasi Peserta / Kuota</label>
            <input
              type="number"
              min="5"
              max="150"
              value={targetCapacity}
              onChange={(e) => setTargetCapacity(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '14px' }}
            />
          </div>

          {/* Request Chips */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Kebutuhan Permintaan ke Merchant</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {CHIP_OPTIONS.map(chip => {
                const isSelected = selectedChips.includes(chip.id);
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => toggleChip(chip.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: 600,
                      border: `1px solid ${isSelected ? '#1B3461' : '#E2E8F0'}`,
                      background: isSelected ? '#1B3461' : '#F8FAFC',
                      color: isSelected ? 'white' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Catatan Tambahan (Opsional)</label>
            <textarea
              placeholder="Contoh: butuh meja panjang untuk cooling down, ada tempat parkir sepeda aman."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              style={{ width: '100%', height: '70px', padding: '10px 12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '13px', resize: 'none' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', fontWeight: 700, cursor: 'pointer' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || communities.length === 0}
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: '#1B3461',
                color: 'white',
                fontWeight: 700,
                cursor: (isSubmitting || communities.length === 0) ? 'not-allowed' : 'pointer',
                opacity: (isSubmitting || communities.length === 0) ? 0.6 : 1
              }}
            >
              {isSubmitting ? 'Mengirim Ajuan...' : 'Kirim Permintaan Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
