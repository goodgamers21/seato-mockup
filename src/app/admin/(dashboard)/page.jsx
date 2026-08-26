"use client";
import React, { useEffect, useState } from 'react';
import { 
  IconTrendingUp, 
  IconTrendingDown, 
  IconMail, 
  IconSparkles, 
  IconCheck, 
  IconAlertCircle, 
  IconBulb, 
  IconClock, 
  IconStarFilled 
} from '@tabler/icons-react';

export default function PartnerDashboardBI() {
  const [partnerRestoId, setPartnerRestoId] = useState(null);
  const [insight, setInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('partnerRestoId');
    if (!id) {
      // For demo fallback if not logged in
      const defaultId = 'mock-id';
      setPartnerRestoId(defaultId);
      loadInsight(defaultId);
    } else {
      setPartnerRestoId(id);
      loadInsight(id);
    }
  }, []);

  const loadInsight = async (restoId) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/insights?restaurantId=${restoId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setInsight(json.data);
      }
    } catch (err) {
      console.error('Failed to load merchant insight:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!partnerRestoId) return;
    setIsSendingEmail(true);
    setNotification(null);

    try {
      const res = await fetch('/api/admin/insights/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: partnerRestoId })
      });
      const data = await res.json();

      if (data.success) {
        setNotification({
          type: 'success',
          message: data.message || 'Laporan performa & AI Insight berhasil dikirim ke email!'
        });
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Gagal mengirim email. Silakan periksa setting resto.'
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Terjadi kesalahan jaringan saat mengirim email.'
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleReanalyzeAi = async () => {
    if (!partnerRestoId) return;
    setIsGeneratingAi(true);
    setNotification(null);

    try {
      const res = await fetch('/api/admin/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: partnerRestoId, period: 'WEEKLY' })
      });
      const data = await res.json();

      if (data.success && data.data) {
        setInsight(data.data);
        setNotification({
          type: 'success',
          message: '✨ Analisis AI berhasil diperbarui dari data ulasan & kunjungan terbaru!'
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Gagal memperbarui analisis AI.'
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const peakHours = insight?.peakHours || {
    busiestDay: 'Sabtu',
    peakTime: '18:30 - 21:30',
    quietDay: 'Selasa',
    quietTime: '13:00 - 16:00'
  };

  const topKeywordsList = insight?.topKeywords && insight.topKeywords.length > 0
    ? insight.topKeywords
    : ['WFC Friendly (42%)', 'Smoking Indoor (28%)', 'Live Music (18%)', 'Colokan Banyak (12%)'];

  const actionItemsList = insight?.actionItems && insight.actionItems.length > 0
    ? insight.actionItems
    : [
        '🚀 Luncurkan Promo "Happy Tuesday WFC": Diskon 20% pada jam 13:00 - 16:00 untuk mendongkrak jam sepi.',
        '⚡ Perbanyak Stopkontak di Meja Pojok: Sesuai kata kunci pencarian terbanyak.',
        '🚗 Sediakan Juru Parkir Khusus di Jumat & Sabtu malam.'
      ];

  const rawMetrics = insight?.rawMetrics || {
    totalViews: 2450,
    profileVisits: 420,
    reservationsCount: 128,
    actualArrivals: 98,
    conversionRate: '3.9%'
  };

  return (
    <div style={{ padding: '32px 40px', background: '#F8FAFC', minHeight: '100%' }}>
      {/* Header with Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
              Business Intelligence & AI
            </h1>
            <span style={{ 
              background: '#EEF2FF', color: '#4F46E5', fontSize: '12px', fontWeight: 700, 
              padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' 
            }}>
              <IconSparkles size={14} /> AI Powered
            </span>
          </div>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Ringkasan data telemetri pengunjung, analisis ulasan, dan rekomendasi taktis.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleReanalyzeAi}
            disabled={isGeneratingAi}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: '12px', color: '#334155', fontWeight: 600, fontSize: '14px',
              cursor: isGeneratingAi ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s ease'
            }}
          >
            <IconSparkles size={16} className={isGeneratingAi ? 'animate-spin text-indigo-600' : 'text-indigo-600'} />
            {isGeneratingAi ? 'Menganalisis...' : 'Refresh AI Insight'}
          </button>

          <button
            onClick={handleSendEmail}
            disabled={isSendingEmail}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', background: '#2563EB', border: 'none',
              borderRadius: '12px', color: '#FFFFFF', fontWeight: 700, fontSize: '14px',
              cursor: isSendingEmail ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)', transition: 'all 0.2s ease'
            }}
          >
            <IconMail size={18} />
            {isSendingEmail ? 'Mengirim Laporan...' : '📧 Kirim Laporan ke Email'}
          </button>
        </div>
      </div>

      {/* Alert Notification Toast */}
      {notification && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 20px', borderRadius: '12px', marginBottom: '24px',
          background: notification.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${notification.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
          color: notification.type === 'success' ? '#166534' : '#991B1B',
          fontSize: '14px', fontWeight: 600
        }}>
          {notification.type === 'success' ? <IconCheck size={20} /> : <IconAlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* AI Summary Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)', 
        borderRadius: '20px', padding: '28px 32px', color: 'white', marginBottom: '28px',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)', border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '10px', 
              background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <IconSparkles size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                AI Executive Summary
              </h2>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                Dihasilkan dari analisis 250+ aktivitas & ulasan pelanggan
              </span>
            </div>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '20px', 
            fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' 
          }}>
            <IconStarFilled size={14} style={{ color: '#FBBF24' }} />
            Sentimen: {insight?.sentimentScore ? insight.sentimentScore.toFixed(1) : '4.7'} / 5.0
          </div>
        </div>

        <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#E2E8F0', margin: '0 0 20px 0' }}>
          {insight?.summaryText || 'Memuat analisis performa AI...'}
        </p>

        {/* Action Items List */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '18px 22px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13px', fontWeight: 700, color: '#38BDF8' }}>
            <IconBulb size={16} />
            REKOMENDASI AKSI BISNIS UNTUK RESTO INI:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {actionItemsList.map((item, idx) => (
              <div key={idx} style={{ fontSize: '14px', color: '#F1F5F9', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#38BDF8', fontWeight: 800 }}>•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <MetricCard title="Total Views" value={rawMetrics.totalViews || '2,450'} change="+18.9%" isPositive={true} />
        <MetricCard title="Profile Visits" value={rawMetrics.profileVisits || '420'} change="+12.3%" isPositive={true} />
        <MetricCard title="Reservations" value={rawMetrics.reservationsCount || '128'} change="+9.1%" isPositive={true} />
        <MetricCard title="Conversion Rate" value={rawMetrics.conversionRate || '3.9%'} change="+0.8%" isPositive={true} />
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Funnel Chart */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '32px' }}>Views & Click Flow</h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <FunnelStep width="100%" label="Views" value={rawMetrics.totalViews || '2,450'} color="#93C5FD" opacity={0.6} />
            <FunnelStep width="80%" label="Profile Visits" value={`${rawMetrics.profileVisits || 420} (17.1%)`} color="#60A5FA" opacity={0.7} />
            <FunnelStep width="60%" label="Reservations" value={`${rawMetrics.reservationsCount || 128} (5.2%)`} color="#3B82F6" opacity={0.8} />
            <FunnelStep width="40%" label="Actual Arrivals" value={`${rawMetrics.actualArrivals || 98} (3.9%)`} color="#2563EB" opacity={0.9} />
          </div>
        </div>

        {/* Heatmap Chart */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Peak Hours Heatmap</h2>
            <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <IconClock size={14} /> Peak: {peakHours.peakTime || '18:30 - 21:30'}
            </span>
          </div>
          <Heatmap />
        </div>

        {/* Top Keywords */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '24px' }}>Top Search Keywords</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {topKeywordsList.map((kw, idx) => (
              <KeywordRow key={idx} keyword={kw} rank={idx + 1} />
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <BottomCard title="Busiest Day" value={peakHours.busiestDay || 'Sabtu'} valueColor="#1E3A8A" />
        <BottomCard title="Quietest Day" value={peakHours.quietDay || 'Selasa'} valueColor="#1E3A8A" />
        <BottomCard title="Avg. Occupancy" value="72%" valueColor="#0EA5A0" />
        <BottomCard title="Churn Risk Customers" value={`${insight?.churnRiskCount || 8} User`} valueColor="#EF4444" />
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function MetricCard({ title, value, change, isPositive }) {
  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
      <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 600, marginBottom: '12px' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-1px' }}>{value}</div>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700,
          color: isPositive ? '#10B981' : '#EF4444',
          background: isPositive ? '#ECFDF5' : '#FEF2F2',
          padding: '4px 8px', borderRadius: '20px'
        }}>
          {change}
        </div>
      </div>
    </div>
  );
}

function FunnelStep({ width, label, value, color, opacity }) {
  return (
    <div style={{ 
      width: width, 
      height: '60px', 
      background: color, 
      opacity: opacity,
      borderTopLeftRadius: '8px', 
      borderTopRightRadius: '8px',
      borderBottomLeftRadius: '16px',
      borderBottomRightRadius: '16px',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: 'white',
      marginBottom: '2px',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.9 }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function Heatmap() {
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const times = ['10:00', '13:00', '16:00', '19:00', '21:00'];
  
  const data = [
    [0.1, 0.2, 0.2, 0.3, 0.4, 0.5, 0.4],
    [0.3, 0.4, 0.4, 0.5, 0.6, 0.8, 0.7],
    [0.2, 0.3, 0.3, 0.4, 0.5, 0.7, 0.6],
    [0.5, 0.6, 0.6, 0.7, 0.9, 1.0, 0.9],
    [0.3, 0.4, 0.3, 0.4, 0.6, 0.8, 0.6],
  ];

  const getColor = (intensity) => {
    if (intensity < 0.3) return `rgba(147, 197, 253, ${intensity * 2})`;
    if (intensity < 0.6) return `rgba(251, 146, 60, ${intensity})`;
    return `rgba(220, 38, 38, ${intensity})`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', marginLeft: '48px', marginBottom: '8px' }}>
        {days.map(d => (
          <div key={d} style={{ flex: 1, textAlign: 'center', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{d}</div>
        ))}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {times.map((time, rIndex) => (
          <div key={time} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '40px', fontSize: '12px', color: '#64748B', fontWeight: 600, textAlign: 'right', marginRight: '8px' }}>
              {time}
            </div>
            <div style={{ display: 'flex', flex: 1, gap: '4px' }}>
              {data[rIndex].map((intensity, cIndex) => (
                <div key={cIndex} style={{ 
                  flex: 1, 
                  aspectRatio: '1.2', 
                  backgroundColor: getColor(intensity),
                  borderRadius: '4px',
                  border: '1px solid rgba(0,0,0,0.05)'
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '24px', gap: '12px' }}>
        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Sepi</span>
        <div style={{ width: '120px', height: '8px', background: 'linear-gradient(90deg, rgba(147,197,253,0.3) 0%, rgba(251,146,60,0.6) 50%, rgba(220,38,38,1) 100%)', borderRadius: '4px' }}></div>
        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Ramai</span>
      </div>
    </div>
  );
}

function KeywordRow({ keyword, rank }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ 
          width: '22px', height: '22px', borderRadius: '6px', 
          background: rank === 1 ? '#FEF3C7' : '#F1F5F9',
          color: rank === 1 ? '#D97706' : '#64748B',
          fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          #{rank}
        </span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{keyword}</span>
      </div>
    </div>
  );
}

function BottomCard({ title, value, valueColor }) {
  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', textAlign: 'center' }}>
      <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 600, marginBottom: '16px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 800, color: valueColor, letterSpacing: '-0.5px' }}>{value}</div>
    </div>
  );
}
