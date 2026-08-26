/**
 * Email Notification Service
 * Supports Resend (Free 3,000 emails/mo) & Nodemailer / Mock Fallback.
 */

export class EmailService {
  /**
   * Sends an email via Resend HTTP API.
   */
  static async sendEmail({ to, subject, html }) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'SEATO Business <onboarding@resend.dev>';

    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: fromEmail,
            to: Array.isArray(to) ? to : [to],
            subject,
            html
          })
        });

        const data = await response.json();
        if (!response.ok) {
          console.error('❌ [EmailService] Resend API error:', data);
          return { success: false, error: data };
        }

        console.log('📧 [EmailService] Email successfully sent via Resend:', data.id);
        return { success: true, messageId: data.id, provider: 'resend' };
      } catch (err) {
        console.error('❌ [EmailService] Error sending email via Resend:', err);
        return { success: false, error: err.message };
      }
    }

    // In development / testing without API Key:
    console.log(`📨 [EmailService - DEV SIMULATION]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`[Preview HTML length: ${html.length} chars]`);
    return { success: true, simulated: true, provider: 'mock_simulator' };
  }

  /**
   * Generates a sleek, modern HTML email template for the Merchant Executive Report.
   */
  static generateReportEmailHtml({ restaurant, insight }) {
    const peakHours = typeof insight.peakHoursJson === 'string'
      ? JSON.parse(insight.peakHoursJson)
      : (insight.peakHoursJson || {});

    const topKeywords = Array.isArray(insight.topKeywords)
      ? insight.topKeywords
      : (typeof insight.topKeywords === 'string' ? JSON.parse(insight.topKeywords) : []);

    const actionItems = Array.isArray(insight.actionItems)
      ? insight.actionItems
      : (typeof insight.actionItems === 'string' ? JSON.parse(insight.actionItems) : []);

    const actionItemsHtml = actionItems
      .map(item => `<li style="margin-bottom: 10px; color: #334155; font-size: 14px; line-height: 1.5;">${item}</li>`)
      .join('');

    const keywordsBadgesHtml = topKeywords
      .map(kw => `<span style="display: inline-block; background: #EEF2FF; color: #4F46E5; font-weight: 600; font-size: 12px; padding: 4px 10px; border-radius: 20px; margin-right: 6px; margin-bottom: 6px;">${kw}</span>`)
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Laporan Performa SEATO</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 32px 16px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%); padding: 32px 28px; text-align: left; color: white;">
      <div style="font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #38BDF8; margin-bottom: 8px;">
        SEATO BUSINESS INTELLIGENCE
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 800; color: #FFFFFF;">
        Laporan Mingguan: ${restaurant.name}
      </h1>
      <p style="margin: 0; font-size: 14px; color: #94A3B8;">
        Ringkasan analisis performa, ulasan pengunjung, dan rekomendasi AI.
      </p>
    </div>

    <div style="padding: 28px;">
      
      <!-- AI Executive Summary Card -->
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
          <span style="font-size: 18px;">🤖</span>
          <span style="font-weight: 700; font-size: 15px; color: #166534;">AI Executive Summary</span>
        </div>
        <p style="margin: 0; color: #14532D; font-size: 14px; line-height: 1.6;">
          ${insight.summaryText}
        </p>
      </div>

      <!-- Quick Metrics Grid -->
      <table style="width: 100%; border-collapse: separate; border-spacing: 12px 0; margin-bottom: 24px;">
        <tr>
          <td style="width: 50%; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center;">
            <div style="font-size: 12px; color: #64748B; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Sentimen Kepuasan</div>
            <div style="font-size: 24px; font-weight: 800; color: #0EA5E9;">⭐ ${insight.sentimentScore ? insight.sentimentScore.toFixed(1) : '4.8'} <span style="font-size: 14px; color: #94A3B8;">/ 5.0</span></div>
          </td>
          <td style="width: 50%; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center;">
            <div style="font-size: 12px; color: #64748B; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Jam Terpadat</div>
            <div style="font-size: 16px; font-weight: 800; color: #1E293B;">${peakHours.peakTime || '18:30 - 21:30'}</div>
            <div style="font-size: 11px; color: #64748B;">${peakHours.busiestDay || 'Jumat & Sabtu'}</div>
          </td>
        </tr>
      </table>

      <!-- Top Keywords -->
      <div style="margin-bottom: 24px;">
        <div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 10px;">
          🔍 Top Kata Kunci Pencarian Pengunjung:
        </div>
        <div>
          ${keywordsBadgesHtml || '<span style="color: #64748B; font-size: 13px;">WFC Friendly, Smoking Indoor, Live Music</span>'}
        </div>
      </div>

      <!-- Action Items / Rekomendasi Bisnis -->
      <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
        <div style="font-weight: 700; font-size: 15px; color: #92400E; margin-bottom: 12px;">
          💡 Rekomendasi Aksi dari AI untuk Minggu Ini:
        </div>
        <ul style="margin: 0; padding-left: 20px;">
          ${actionItemsHtml}
        </ul>
      </div>

      <!-- CTA Button to Dashboard -->
      <div style="text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
        <a href="http://localhost:3000/admin" style="display: inline-block; background: #2563EB; color: #FFFFFF; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
          Buka Dashboard SEATO
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background: #F1F5F9; padding: 20px 28px; text-align: center; font-size: 12px; color: #64748B;">
      Laporan otomatis digenerate oleh <strong>SEATO Partner Platform</strong>.<br>
      Ada pertanyaan? Hubungi partner support di <a href="mailto:support@seato.id" style="color: #2563EB; text-decoration: none;">support@seato.id</a>
    </div>

  </div>
</body>
</html>
`;
  }
}
