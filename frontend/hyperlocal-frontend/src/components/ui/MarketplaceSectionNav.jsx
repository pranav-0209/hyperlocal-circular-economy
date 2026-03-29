import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

const NAV_ITEMS = [
  { label: 'My Listings', path: ROUTES.MY_LISTINGS, icon: 'sell' },
  { label: 'Requests', path: ROUTES.MARKETPLACE_REQUESTS, icon: 'inbox' },
  { label: 'Exchanges', path: ROUTES.MARKETPLACE_EXCHANGES, icon: 'sync_alt' },
];

export default function MarketplaceSectionNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === ROUTES.MY_LISTINGS) {
      return location.pathname === ROUTES.MY_LISTINGS || location.pathname === ROUTES.LEGACY_MY_LISTINGS;
    }

    return location.pathname === path;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 inline-flex items-center gap-1.5 flex-wrap">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.path}
          type="button"
          onClick={() => navigate(item.path)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            isActive(item.path)
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted-green hover:text-charcoal hover:bg-gray-50'
          }`}
        >
          <span className="material-symbols-outlined text-base">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
