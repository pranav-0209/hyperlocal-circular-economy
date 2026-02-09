/**
 * StatsCard Component
 * Dashboard metric display card
 */
export default function StatsCard({ icon, label, value, trend, trendUp, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        {trend && (
          <span className={`text-sm font-medium flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            <span className="material-symbols-outlined text-sm">
              {trendUp ? 'trending_up' : 'trending_down'}
            </span>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
