import React from 'react';
import { Clock, CheckCircle2, FileSignature, Eye, Mail } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const normalized = (status || '').toLowerCase();

  const configs = {
    pending: {
      label: 'Pending Signature',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      Icon: Clock,
    },
    partially_signed: {
      label: 'Partially Signed',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
      Icon: FileSignature,
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      Icon: CheckCircle2,
    },
    signed: {
      label: 'Signed',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      Icon: CheckCircle2,
    },
    viewed: {
      label: 'Viewed',
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      dot: 'bg-purple-500',
      Icon: Eye,
    },
    invited: {
      label: 'Invited',
      bg: 'bg-neutral-100 text-neutral-700 border-neutral-200',
      dot: 'bg-neutral-400',
      Icon: Mail,
    },
  };

  const config = configs[normalized] || {
    label: status || 'Unknown',
    bg: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    dot: 'bg-neutral-400',
    Icon: Clock,
  };

  const Icon = config.Icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${config.bg} ${
        isSm ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  );
}
