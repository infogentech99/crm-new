export async function sendUserEmail(formData: FormData): Promise<{ message: string }> {
  const res = await fetch('/api/send-email', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Failed to send email');
  return await res.json();
}


export async function createEmail(formData: FormData): Promise<{ message: string }> {
  const res = await fetch('/api/send-invoice', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Failed to send email');
  return await res.json();
}