/**
 * VerificationTimeline Component
 * Visual timeline for verification process status.
 */
export default function VerificationTimeline() {
  return (
    <div className="my-10 px-4">
      <div className="relative">
        {/* Timeline Container */}
        <div className="flex items-center justify-between">
          {/* Step 1: Submitted */}
          <div className="flex flex-col items-center gap-3 flex-1">
            <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-md">
              ✓
            </div>
            <p className="text-sm font-semibold text-charcoal whitespace-nowrap">
              Submitted
            </p>
            <p className="text-sm text-muted-green whitespace-nowrap">
              Just now
            </p>
          </div>

          {/* Connector Line 1 */}
          <div className="flex-1 h-1 bg-green-500 mx-3 mb-12"></div>

          {/* Step 2: Under Review */}
          <div className="flex flex-col items-center gap-3 flex-1">
            <div className="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-md animate-pulse">
              ⏱
            </div>
            <p className="text-sm font-semibold text-charcoal whitespace-nowrap">
              Under Review
            </p>
            <p className="text-sm text-muted-green whitespace-nowrap">
              In progress
            </p>
          </div>

          {/* Connector Line 2 */}
          <div className="flex-1 h-1 bg-gray-300 mx-3 mb-12"></div>

          {/* Step 3: Approved */}
          <div className="flex flex-col items-center gap-3 flex-1">
            <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-md">
              ✓
            </div>
            <p className="text-sm font-semibold text-charcoal whitespace-nowrap">
              Approved
            </p>
            <p className="text-sm text-muted-green whitespace-nowrap">
              Future
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
