/**
 * PaginationControls
 * Reusable pager for superadmin list pages.
 */
export default function PaginationControls({
  pageNumber = 0,
  pageSize = 10,
  totalElements = 0,
  totalPages = 0,
  itemLabel = 'items',
  onPageChange,
}) {
  const safePageSize = Number(pageSize) > 0 ? Number(pageSize) : 10;
  const safeTotalElements = Math.max(0, Number(totalElements) || 0);
  const computedTotalPages = Math.max(1, Math.ceil(safeTotalElements / safePageSize));
  const safeTotalPages = Number(totalPages) > 0 ? Number(totalPages) : computedTotalPages;

  if (safeTotalPages <= 1) return null;

  const safePageNumber = Math.min(Math.max(0, Number(pageNumber) || 0), safeTotalPages - 1);

  const start = safeTotalElements === 0 ? 0 : safePageNumber * safePageSize + 1;
  const end = Math.min((safePageNumber + 1) * safePageSize, safeTotalElements);

  return (
    <div className="mt-6 flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-sm text-gray-600">
        Showing {start} to {end} of {safeTotalElements} {itemLabel}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(0, safePageNumber - 1))}
          disabled={safePageNumber === 0}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <div className="flex items-center gap-2 px-4">
          <span className="text-sm text-gray-600">
            Page {safePageNumber + 1} of {safeTotalPages}
          </span>
        </div>
        <button
          onClick={() => onPageChange(Math.min(safeTotalPages - 1, safePageNumber + 1))}
          disabled={safePageNumber >= safeTotalPages - 1}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
