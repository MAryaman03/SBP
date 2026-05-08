const { sendBrevoEmail, sendBrevoSMS } = require('../lib/brevo');
const Notification = require('../models/Notification.model');

/**
 * Modern HTML Template for Booking Confirmation
 */
const generateBookingEmailHTML = (name, serviceName, date, timeSlot, bookingRef, isIntervention = false) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fc; color: #1a1a1a; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .header { background: #111111; padding: 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 0; font-weight: 600; letter-spacing: -0.5px; }
    .content { padding: 40px; }
    .greeting { font-size: 20px; font-weight: 600; margin: 0 0 16px; color: #111; }
    .subtext { font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 32px; }
    
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
    .card-header { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 0 0 16px; }
    
    .detail-row { display: table; width: 100%; margin-bottom: 16px; }
    .detail-row:last-child { margin-bottom: 0; }
    .detail-label { display: table-cell; width: 35%; color: #64748b; font-size: 14px; }
    .detail-value { display: table-cell; width: 65%; color: #0f172a; font-size: 15px; font-weight: 500; text-align: right; }
    
    .badge { display: inline-block; background: #ecfdf5; color: #059669; padding: 6px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; margin-bottom: 24px; border: 1px solid #a7f3d0; }
    
    .footer { border-top: 1px solid #e2e8f0; padding: 32px 40px; text-align: center; }
    .footer p { margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; }
    .footer a { color: #111; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isIntervention ? 'Mindpex Intervention' : 'Snigdha Beauty Parlour'}</h1>
    </div>
    <div class="content">
      <div class="badge">✓ Confirmed</div>
      <h2 class="greeting">Hello ${name},</h2>
      <p class="subtext">Your ${isIntervention ? 'intervention session' : 'appointment'} has been successfully scheduled. Here are your details:</p>
      
      <div class="card">
        <p class="card-header">Booking Details</p>
        <div class="detail-row">
          <span class="detail-label">Reference</span>
          <span class="detail-value" style="font-family: monospace; letter-spacing: 1px;">${bookingRef}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">${isIntervention ? 'Intervention' : 'Service'}</span>
          <span class="detail-value">${serviceName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time</span>
          <span class="detail-value">${timeSlot}</span>
        </div>
      </div>
      
      <p class="subtext" style="margin-bottom: 0;">Please arrive 5-10 minutes early. If you need to reschedule, kindly contact us at least 24 hours in advance.</p>
    </div>
    <div class="footer">
      <p>Need support? Contact us at <a href="mailto:support@sbp.com">support@sbp.com</a></p>
      <p style="margin-top: 12px; color: #94a3b8;">© ${new Date().getFullYear()} ${isIntervention ? 'Mindpex' : 'Snigdha Beauty Parlour'}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Handle Booking Confirmation Notifications
 */
exports.notifyBookingConfirmed = async ({ user, appointment, service }) => {
  try {
    const customerName = user.name || appointment.guestName || 'Valued Client';
    const customerEmail = user.email || appointment.guestEmail;
    const customerPhone = user.phone || appointment.guestPhone;
    const isIntervention = service.category === 'Intervention' || service.name.includes('Intervention');

    // 1. Send Email (Async, non-blocking)
    if (customerEmail) {
      const emailHtml = generateBookingEmailHTML(
        customerName,
        service.name,
        appointment.bookingDate,
        appointment.bookingTime,
        appointment.bookingReference,
        isIntervention
      );
      
      sendBrevoEmail(
        customerEmail,
        `Confirmed: ${service.name} on ${new Date(appointment.bookingDate).toLocaleDateString()}`,
        emailHtml
      ).then(() => {
        console.log(`[NotificationService] Email sent successfully to ${customerEmail}`);
      }).catch(err => {
        console.warn(`[Notify] Email to ${customerEmail} skipped (Brevo IP not authorized)`);
      });
    }

    // 2. Send SMS (Async, non-blocking)
    if (customerPhone) {
      // Concise SMS format
      const smsText = `Your booking for ${service.name} on ${new Date(appointment.bookingDate).toLocaleDateString()} at ${appointment.bookingTime} is confirmed. Ref: ${appointment.bookingReference}. - SBP`;
      
      sendBrevoSMS(customerPhone, smsText).then(() => {
        console.log(`[NotificationService] SMS sent successfully to ${customerPhone}`);
      }).catch(err => {
        console.warn(`[Notify] SMS to ${customerPhone} skipped (Brevo IP not authorized)`);
      });
    }

    // 3. Save internal notification (if user exists)
    if (user._id) {
      await Notification.create({
        userId: user._id,
        title: 'Booking Confirmed',
        message: `Your appointment for ${service.name} is confirmed.`,
        type: 'booking',
        relatedBookingId: appointment._id
      }).catch(err => console.error('[NotificationService] Failed to save DB notification:', err.message));
    }

    return { success: true };
  } catch (error) {
    console.error('[NotificationService] Unexpected error in notifyBookingConfirmed:', error);
    // Return true anyway to prevent blocking the booking flow if notifications fail
    return { success: false, error: error.message };
  }
};
