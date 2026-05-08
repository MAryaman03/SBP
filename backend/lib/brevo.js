// Using native global fetch (Node 18+)

const BREVO_API_KEY = process.env.BREVO_ENV;
const BREVO_BASE_URL = 'https://api.brevo.com/v3';

if (!BREVO_API_KEY) {
  console.warn('BREVO_ENV API key is not defined in environment variables.');
}

const brevoHeaders = {
  'accept': 'application/json',
  'content-type': 'application/json',
  'api-key': BREVO_API_KEY
};

/**
 * Send an email using Brevo Transactional Email API
 */
const sendBrevoEmail = async (to, subject, htmlContent) => {
  try {
    const payload = {
      sender: {
        name: 'Snigdha Beauty Parlour',
        email: 'noreply@snigdhabeautyparlour.com'
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent
    };

    // Use native global fetch if available (Node 18+), else fallback
    const response = await fetch(`${BREVO_BASE_URL}/smtp/email`, {
      method: 'POST',
      headers: brevoHeaders,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Brevo Email Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('[Brevo] Email skipped:', error.message.substring(0, 80));
    throw error;
  }
};

/**
 * Send an SMS using Brevo Transactional SMS API
 */
const sendBrevoSMS = async (recipient, textContent) => {
  try {
    // Format recipient to international format if not already (e.g. +91)
    let formattedPhone = recipient;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone.replace(/\D/g, '');
    }

    const payload = {
      type: 'transactional',
      unicodeEnabled: false,
      sender: 'SBP',
      recipient: formattedPhone,
      content: textContent
    };

    const response = await fetch(`${BREVO_BASE_URL}/transactionalSMS/sms`, {
      method: 'POST',
      headers: brevoHeaders,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Brevo SMS Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('[Brevo] SMS skipped:', error.message.substring(0, 80));
    throw error;
  }
};

module.exports = {
  sendBrevoEmail,
  sendBrevoSMS
};
