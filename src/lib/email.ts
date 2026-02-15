import { Resend } from 'resend';

// Lazy init to avoid build-time errors
let resend: Resend | null = null;

function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface FormField {
  id: string;
  label: string;
  type: string;
}

interface NewSubmissionEmailProps {
  to: string;
  applicantName: string;
  applicantEmail: string;
  formTitle: string;
  formData: Record<string, string>;
  formFields?: FormField[];
  viewUrl: string;
}

export async function sendNewSubmissionEmail({
  to,
  applicantName,
  applicantEmail,
  formTitle,
  formData,
  formFields = [],
  viewUrl,
}: NewSubmissionEmailProps) {
  // Skip if no API key configured
  const client = getResendClient();
  if (!client) {
    console.log('RESEND_API_KEY not configured, skipping email');
    return null;
  }

  // Build form data HTML with proper labels
  let formDataHtml: string;
  if (formFields.length > 0) {
    // Use field labels in form order
    formDataHtml = formFields
      .filter(field => formData[field.id] !== undefined)
      .map(field => `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">${field.label}</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formData[field.id] || '—'}</td></tr>`)
      .join('');
  } else {
    // Fallback to raw keys
    formDataHtml = Object.entries(formData)
      .map(([key, value]) => `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">${key}</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${value || '—'}</td></tr>`)
      .join('');
  }

  try {
    const { data, error } = await client.emails.send({
      from: 'EnrolStudio <notifications@enrol.studio>',
      to: [to],
      subject: `New Application: ${applicantName || applicantEmail || 'Someone'} applied to ${formTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Application Received! 🎉</h1>
          </div>
          
          <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin-top: 0;">Someone just submitted an application to <strong>${formTitle}</strong>.</p>
            
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="margin: 0 0 15px 0; font-size: 16px; color: #374151;">Applicant Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666; width: 40%;">Name</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 500;">${applicantName || '—'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Email</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${applicantEmail || '—'}</td>
                </tr>
              </table>
            </div>

            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="margin: 0 0 15px 0; font-size: 16px; color: #374151;">Application Data</h2>
              <table style="width: 100%; border-collapse: collapse;">
                ${formDataHtml}
              </table>
            </div>
            
            <a href="${viewUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin-top: 10px;">
              View in Pipeline →
            </a>
            
            <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; margin-bottom: 0;">
              Sent by EnrolStudio
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    return null;
  }
}
