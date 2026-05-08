const nodemailer = require('nodemailer');

const isEmailConfigured = process.env.EMAIL_USER && 
  !process.env.EMAIL_USER.includes('replace') && 
  process.env.EMAIL_PASS && 
  !process.env.EMAIL_PASS.includes('replace');

const transporter = isEmailConfigured ? nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
}) : null;

if (!isEmailConfigured) {
  console.log('📧 Email notifications disabled (EMAIL_USER/EMAIL_PASS not configured in .env)');
}

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

// ─── Customer Booking Confirmation Email ─────────────────────────────────────
exports.sendBookingConfirmationEmail = async ({ to, name, bookingRef, serviceName, date, timeSlot }) => {
  if (!transporter) return console.log(`📧 [Skip] Confirmation email for ${bookingRef} (email not configured)`);
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Snigdha Beauty Parlour <noreply@snigdhabeautyparlour.com>',
    to,
    subject: `✨ Booking Confirmed – ${bookingRef} | Snigdha Beauty Parlour`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Georgia, serif; background: #faf8f5; color: #2c2c2c; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1a1a1a, #2d2d2d); padding: 40px; text-align: center;">
            <h1 style="color: #c9a96e; font-size: 28px; margin: 0; letter-spacing: 3px;">SNIGDHA BEAUTY PARLOUR</h1>
            <p style="color: #a0a0a0; font-size: 13px; margin: 8px 0 0; letter-spacing: 2px; text-transform: uppercase;">Premium Beauty Experience</p>
          </div>
          <!-- Body -->
          <div style="padding: 40px;">
            <h2 style="color: #1a1a1a; font-size: 22px; margin: 0 0 8px;">Your booking is confirmed! ✨</h2>
            <p style="color: #666; line-height: 1.6;">Hello <strong>${name}</strong>, thank you for choosing Snigdha Beauty Parlour. We're excited to see you!</p>

            <!-- Booking Reference -->
            <div style="background: #faf3e8; border: 2px dashed #c9a96e; border-radius: 10px; padding: 24px; text-align: center; margin: 28px 0;">
              <p style="margin: 0 0 6px; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">YOUR BOOKING REFERENCE</p>
              <h2 style="color: #c9a96e; font-size: 32px; letter-spacing: 4px; margin: 0; font-weight: bold;">${bookingRef}</h2>
              <p style="color: #888; font-size: 11px; margin: 8px 0 0;">Keep this for your records</p>
            </div>

            <!-- Details -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; color: #888; font-size: 13px;">Service</td>
                <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600; text-align: right;">${serviceName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; color: #888; font-size: 13px;">Date</td>
                <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600; text-align: right;">${formatDate(date)}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #888; font-size: 13px;">Time</td>
                <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600; text-align: right;">${timeSlot}</td>
              </tr>
            </table>

            <p style="color: #666; line-height: 1.6; margin-top: 28px; font-size: 14px;">
              Need to reschedule or cancel? Contact us at <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #c9a96e;">${process.env.ADMIN_EMAIL}</a> at least 24 hours in advance.
            </p>
          </div>
          <!-- Footer -->
          <div style="background: #1a1a1a; padding: 24px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Snigdha Beauty Parlour. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  return transporter.sendMail(mailOptions);
};

// ─── Admin Notification Email ─────────────────────────────────────────────────
exports.sendAdminNotificationEmail = async ({ bookingRef, customerName, customerEmail, serviceName, date, timeSlot }) => {
  if (!transporter) return console.log(`📧 [Skip] Admin notification for ${bookingRef} (email not configured)`);
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Snigdha Beauty Parlour <noreply@snigdhabeautyparlour.com>',
    to: process.env.ADMIN_EMAIL,
    subject: `📅 New Booking: ${bookingRef} – ${serviceName}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 500px; margin: auto; padding: 24px; background: #faf8f5;">
        <h2 style="color: #1a1a1a;">New Appointment Booked</h2>
        <p><strong>Booking Ref:</strong> <span style="color: #c9a96e; font-size: 18px;">${bookingRef}</span></p>
        <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Date:</strong> ${formatDate(date)}</p>
        <p><strong>Time:</strong> ${timeSlot}</p>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
};

// ─── Booking Status Update Notification Email ─────────────────────────────────
exports.sendStatusUpdateEmail = async ({ to, name, bookingRef, serviceName, date, timeSlot, newStatus }) => {
  if (!transporter) return console.log(`📧 [Skip] Status update (${newStatus}) email for ${bookingRef} (email not configured)`);
  const statusMessages = {
    confirmed: { emoji: '✅', title: 'Booking Confirmed!', color: '#2ecc71', msg: 'Your appointment has been confirmed by our team. We look forward to seeing you!' },
    completed: { emoji: '🎉', title: 'Booking Completed', color: '#9b59b6', msg: 'We hope you enjoyed your experience at Snigdha Beauty Parlour!' },
    cancelled: { emoji: '❌', title: 'Booking Cancelled', color: '#e74c3c', msg: 'Your appointment has been cancelled. If you have any questions, please contact us.' },
  };
  const info = statusMessages[newStatus] || { emoji: '📋', title: `Status: ${newStatus}`, color: '#c9a96e', msg: 'Your appointment status has been updated.' };

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Snigdha Beauty Parlour <noreply@snigdhabeautyparlour.com>',
    to,
    subject: `${info.emoji} ${info.title} – ${bookingRef} | Snigdha Beauty Parlour`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Georgia, serif; background: #faf8f5; color: #2c2c2c; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #1a1a1a, #2d2d2d); padding: 40px; text-align: center;">
            <h1 style="color: #c9a96e; font-size: 28px; margin: 0; letter-spacing: 3px;">SNIGDHA BEAUTY PARLOUR</h1>
            <p style="color: #a0a0a0; font-size: 13px; margin: 8px 0 0; letter-spacing: 2px; text-transform: uppercase;">Premium Beauty Experience</p>
          </div>
          <div style="padding: 40px;">
            <div style="background: ${info.color}15; border-left: 4px solid ${info.color}; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h2 style="color: ${info.color}; font-size: 22px; margin: 0;">${info.emoji} ${info.title}</h2>
            </div>
            <p style="color: #666; line-height: 1.6;">Hello <strong>${name}</strong>, ${info.msg}</p>

            <div style="background: #faf3e8; border: 2px dashed #c9a96e; border-radius: 10px; padding: 24px; text-align: center; margin: 28px 0;">
              <p style="margin: 0 0 6px; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">BOOKING REFERENCE</p>
              <h2 style="color: #c9a96e; font-size: 28px; letter-spacing: 4px; margin: 0; font-weight: bold;">${bookingRef}</h2>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; color: #888; font-size: 13px;">Service</td>
                <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600; text-align: right;">${serviceName || 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; color: #888; font-size: 13px;">Date</td>
                <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600; text-align: right;">${date ? formatDate(date) : 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; color: #888; font-size: 13px;">Time</td>
                <td style="padding: 12px 0; color: #1a1a1a; font-weight: 600; text-align: right;">${timeSlot || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #888; font-size: 13px;">Status</td>
                <td style="padding: 12px 0; font-weight: 600; text-align: right; color: ${info.color}; text-transform: uppercase;">${newStatus}</td>
              </tr>
            </table>
          </div>
          <div style="background: #1a1a1a; padding: 24px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Snigdha Beauty Parlour. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  return transporter.sendMail(mailOptions);
};
