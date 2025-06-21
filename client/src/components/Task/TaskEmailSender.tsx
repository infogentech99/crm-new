import { toast } from 'sonner';
import { sendUserEmail } from '@services/emailService';
import { Task } from '@customTypes/index';

interface TaskEmailSenderProps {
  assignees: string[];
  taskData: Pick<Task, 'title' | 'description' | 'dueDate' | 'priority' | 'status'>;
  mode: 'Create' | 'Edit';
}

export const TaskEmailSender = async ({ assignees, taskData, mode }: TaskEmailSenderProps) => {
  if (assignees.length === 0) {
    return;
  }

  const emailSubject = mode === 'Create' ? `New Task Assigned: ${taskData.title}` : `Task Updated: ${taskData.title}`;
  const emailBody = `
    <p>Dear Team Member,</p>
    <p>A task has been ${mode === 'Create' ? 'assigned to' : 'updated for'} you:</p>
    <p><strong>Title:</strong> ${taskData.title}</p>
    <p><strong>Description:</strong> ${taskData.description || 'N/A'}</p>
    <p><strong>Due Date:</strong> ${taskData.dueDate || 'N/A'}</p>
    <p><strong>Priority:</strong> ${taskData.priority}</p>
    <p><strong>Status:</strong> ${taskData.status}</p>
    <p>Please check the CRM for more details.</p>
    <p>Regards,<br/>CRM Team</p>
  `;

  const emailFormData = new FormData();
  emailFormData.append('to', assignees.join(','));
  emailFormData.append('subject', emailSubject);
  emailFormData.append('body', emailBody);

  try {
    await sendUserEmail(emailFormData);
    toast.success('Notification email sent to assignees!');
  } catch (emailErr) {
    console.error('Failed to send notification email:', emailErr);
    toast.error('Failed to send notification email to assignees.');
  }
};
