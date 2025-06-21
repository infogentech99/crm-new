import { MeetingEmailData } from '@customTypes/index';
import { sendUserEmail } from '@services/emailService';

export async function sendMeetingEmail(data: MeetingEmailData): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append('subject', `Meeting Scheduled: ${data.title}`);
  formData.append('body', `
    <p>Dear Participant,</p>
    <p>A new meeting has been scheduled with the following details:</p>
    <p><strong>Title:</strong> ${data.title}</p>
    <p><strong>Date & Time:</strong> ${new Date(data.date).toLocaleString()}</p>
    <p><strong>Duration:</strong> ${data.duration} minutes</p>
    <p><strong>Platform:</strong> ${data.platform}</p>
    <p><strong>Meeting Link:</strong> ${data.meetlink ? `<a href="${data.meetlink}">${data.meetlink}</a>` : 'N/A'}</p>
    <p><strong>Description:</strong> ${data.description || 'No description provided.'}</p>
    <p>Please join on time.</p>
    <p>Best regards,<br/>Your CRM Team</p>
  `);
  formData.append('to', data.participants.join(','));
  
  try {
    const result = await sendUserEmail(formData);
    return result;
  } catch (error) {
    console.error('Error sending meeting email:', error);
    throw error;
  }
}
