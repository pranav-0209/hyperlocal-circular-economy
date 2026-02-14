/**
 * StatusBadge Component
 * Colored status indicator chip for VerificationStatus enum
 */
export default function StatusBadge({ status }) {
  const statusConfig = {
    not_verified: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Not Verified',
    },
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Pending',
    },
    verified: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Verified',
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Rejected',
    },
    suspended: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: 'Suspended',
    },
    active: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'Active',
    },
  };

  const config = statusConfig[status] || statusConfig.not_verified;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
