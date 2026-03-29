import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import HomeNavbar from '../components/ui/HomeNavbar';
import AppFooter from '../components/ui/AppFooter';
import MarketplaceSectionNav from '../components/ui/MarketplaceSectionNav';
import { ROUTES } from '../constants';
import { getIncomingRequests, getMyListings, getMySentRequests } from '../services/marketplaceService';

export default function MarketplaceActivityPage() {
  const navigate = useNavigate();

  const { data: myListings = [] } = useQuery({
    queryKey: ['myListings'],
    queryFn: getMyListings,
  });

  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['incomingRequests'],
    queryFn: () => getIncomingRequests({ page: 0, size: 20 }),
  });

  const { data: sentRequests = [] } = useQuery({
    queryKey: ['sentRequests'],
    queryFn: () => getMySentRequests({ page: 0, size: 20 }),
  });

  const pendingIncoming = incomingRequests.filter((request) => request.status === 'PENDING').length;
  const pendingSent = sentRequests.filter((request) => request.status === 'PENDING').length;
  const borrowedCount = sentRequests.filter((request) => ['APPROVED', 'COMPLETED'].includes(request.status)).length;
  const lentCount = incomingRequests.filter((request) => ['APPROVED', 'COMPLETED'].includes(request.status)).length;

  const cards = [
    {
      title: 'My Listings',
      description: 'Manage listed items, edit details, and update availability.',
      metric: `${myListings.length} total`,
      action: 'Open Listings',
      path: ROUTES.MY_LISTINGS,
      icon: 'sell',
    },
    {
      title: 'Requests',
      description: 'Review incoming requests and track requests you have sent.',
      metric: `${pendingIncoming} incoming pending`,
      subMetric: `${pendingSent} sent pending`,
      action: 'Open Requests',
      path: ROUTES.MARKETPLACE_REQUESTS,
      icon: 'inbox',
    },
    {
      title: 'Exchanges',
      description: 'Track active and completed borrowed or lent item exchanges.',
      metric: `${borrowedCount} borrowed`,
      subMetric: `${lentCount} lent`,
      action: 'Open Exchanges',
      path: ROUTES.MARKETPLACE_EXCHANGES,
      icon: 'sync_alt',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      <div className="pt-16 bg-white border-b border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-1.5 text-sm text-muted-green">
          <button onClick={() => navigate(ROUTES.DISCOVER)} className="hover:text-primary transition-colors">Marketplace</button>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-charcoal font-semibold">My Activity</span>
        </div>
      </div>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 pb-8 flex-1 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-charcoal">My Activity</h1>
          <p className="text-sm text-muted-green">A focused workspace for all your marketplace operations.</p>
        </div>

        <MarketplaceSectionNav />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">{card.icon}</span>
              </div>
              <h2 className="text-lg font-bold text-charcoal">{card.title}</h2>
              <p className="text-sm text-muted-green mt-1">{card.description}</p>
              <p className="text-sm font-semibold text-primary mt-4">{card.metric}</p>
              {card.subMetric && <p className="text-xs text-muted-green mt-0.5">{card.subMetric}</p>}
              <button
                type="button"
                onClick={() => navigate(card.path)}
                className="mt-5 inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                {card.action}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
