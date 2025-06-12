
import React from 'react';

interface BadgeDotProps {
  label: string;
  type: 'status' | 'callResponse';
}

const getColor = (type: BadgeDotProps['type'], label: string): string => {
  const normalized = label.toLowerCase();

  if (type === 'callResponse') {
    if (normalized === 'picked') return 'bg-green-500';
    if (normalized === 'not response') return 'bg-red-500';
    if (normalized === 'talk to later') return 'bg-yellow-500';
    return 'bg-gray-400';
  }

  if (type === 'status') {
    switch (normalized) {
      case 'approved':
      case 'completed':
        return 'bg-green-500';

      case 'denied':
        return 'bg-red-500';

      case 'pending_approval':
      case 'processing':
      case 'processing_payments':
        return 'bg-yellow-500';

      case 'quotation_submitted':
      case 'invoice_issued':
        return 'bg-blue-500';

      case 'new':
        return 'bg-purple-500';

      default:
        return 'bg-gray-400';
    }
  }

  return 'bg-gray-400';
};

export default function BadgeDot({ label, type }: BadgeDotProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="capitalize">{label.replace(/_/g, ' ')}</span>
      <span className={`h-2 w-2 rounded-full ${getColor(type, label)}`} />
    </div>
  );
}
