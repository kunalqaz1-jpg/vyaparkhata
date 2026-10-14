export function toPaise(amount: number): number {
  return Math.round((Number(amount) || 0) * 100);
}

export function fromPaise(paise: number): number {
  return (Number(paise) || 0) / 100;
}

export function formatINR(amount: number, showDecimals = false): string {
  const validAmount = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(validAmount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

export function buildWhatsAppReminderUrl(params: {
  phone: string;
  customerName: string;
  businessName: string;
  amount: number;
  dueDate?: string;
  upiId?: string;
}): string {
  // Clean phone number (add 91 if 10 digits)
  let cleanPhone = params.phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  const message = `Namaste ${params.customerName},\nThis is a gentle payment reminder from ${params.businessName}.\nYour outstanding balance is *${formatINR(params.amount)}*${params.dueDate ? ` (Due: ${formatDate(params.dueDate)})` : ''}.\n${params.upiId ? `Please pay to UPI ID: *${params.upiId}*\n` : ''}Thank you for your business!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
