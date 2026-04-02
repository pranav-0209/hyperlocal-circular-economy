import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import HomeNavbar from '../components/ui/HomeNavbar';
import AppFooter from '../components/ui/AppFooter';
import MarketplaceSectionNav from '../components/ui/MarketplaceSectionNav';
import { ROUTES } from '../constants';
import { getIncomingRequests, getMyListings, getMySentRequests, getPendingReviews } from '../services/marketplaceService';

export default function MarketplaceActivityPage() {
  const navigate = useNavigate();

  const { data: myListings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['myListings'],
    queryFn: getMyListings,
  });

  const { data: incomingRequests = [], isLoading: incomingLoading } = useQuery({
    queryKey: ['incomingRequests'],
    queryFn: () => getIncomingRequests({ page: 0, size: 20 }),
  });

  const { data: sentRequests = [], isLoading: sentLoading } = useQuery({
    queryKey: ['sentRequests'],
    queryFn: () => getMySentRequests({ page: 0, size: 20 }),
  });

  const normalizeStatus = (status) => String(status || '').toUpperCase();

  const pendingIncoming = incomingRequests.filter((request) => normalizeStatus(request.status) === 'PENDING').length;
  const pendingSent = sentRequests.filter((request) => normalizeStatus(request.status) === 'PENDING').length;
  const borrowedCount = sentRequests.filter((request) => ['APPROVED', 'COMPLETED'].includes(normalizeStatus(request.status))).length;
  const lentCount = incomingRequests.filter((request) => ['APPROVED', 'COMPLETED'].includes(normalizeStatus(request.status))).length;
  const availableListings = myListings.filter((listing) => normalizeStatus(listing.status) === 'AVAILABLE').length;
  const totalRequests = incomingRequests.length + sentRequests.length;
  const totalPendingRequests = pendingIncoming + pendingSent;
  const isLoadingCards = listingsLoading || incomingLoading || sentLoading;

  const { data: pendingReviews = [], isLoading: pendingReviewsLoading, isError: pendingReviewsError } = useQuery({
    queryKey: ['pendingReviews'],
    queryFn: getPendingReviews,
  });

  const submittedReviewTransactions = (() => {
    try {
      const parsed = JSON.parse(sessionStorage.getItem('submittedReviewTransactions') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const visiblePendingReviews = pendingReviews.filter(
    (task) => !submittedReviewTransactions.includes(task.transactionId)
  );

  const cards = [
    {
      title: 'My Listings',
      description: 'Manage listed items, edit details, and update availability.',
      metric: `${myListings.length} total`,
      subMetric: `${availableListings} currently available`,
      badge: `${Math.max(myListings.length - availableListings, 0)} unavailable`,
      action: 'Open Listings',
      path: ROUTES.MY_LISTINGS,
      icon: 'sell',
      iconWrapClass: 'bg-emerald-100 text-emerald-700',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
      borderClass: 'border-emerald-100',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Requests',
      description: 'Review incoming requests and track requests you have sent.',
      metric: `${totalRequests} total requests`,
      subMetric: `${incomingRequests.length} incoming | ${sentRequests.length} sent`,
      badge: `${totalPendingRequests} pending`,
      action: 'Open Requests',
      path: ROUTES.MARKETPLACE_REQUESTS,
      icon: 'inbox',
      iconWrapClass: 'bg-sky-100 text-sky-700',
      buttonClass: 'bg-sky-600 hover:bg-sky-700',
      borderClass: 'border-sky-100',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      title: 'Exchanges',
      description: 'Track active and completed borrowed or lent item exchanges.',
      metric: `${borrowedCount} borrowed`,
      subMetric: `${lentCount} lent`,
      badge: `${borrowedCount + lentCount} total exchanges`,
      action: 'Open Exchanges',
      path: ROUTES.MARKETPLACE_EXCHANGES,
      icon: 'sync_alt',
      iconWrapClass: 'bg-violet-100 text-violet-700',
      buttonClass: 'bg-violet-600 hover:bg-violet-700',
      borderClass: 'border-violet-100',
      badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
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
          {isLoadingCards
            ? [1, 2, 3].map((cardIndex) => (
              <div key={cardIndex} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
                <div className="w-11 h-11 rounded-xl bg-gray-100 mb-4" />
                <div className="h-5 w-1/2 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-full bg-gray-100 rounded mb-2" />
                <div className="h-4 w-2/3 bg-gray-100 rounded mb-4" />
                <div className="h-5 w-1/3 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-2/5 bg-gray-100 rounded mb-5" />
                <div className="h-10 w-full bg-gray-200 rounded-xl" />
              </div>
            ))
            : cards.map((card) => (
              <div key={card.title} className={`bg-white rounded-2xl border ${card.borderClass} shadow-sm p-5 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-11 h-11 rounded-xl ${card.iconWrapClass} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full border ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-charcoal mt-4">{card.title}</h2>
                <p className="text-sm text-muted-green mt-1">{card.description}</p>

                <p className="text-base font-bold text-charcoal mt-4">{card.metric}</p>
                {card.subMetric && <p className="text-xs text-muted-green mt-0.5">{card.subMetric}</p>}

                <button
                  type="button"
                  onClick={() => navigate(card.path)}
                  className={`mt-5 inline-flex items-center justify-center gap-1.5 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors ${card.buttonClass}`}
                >
                  {card.action}
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            ))}
        </div>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div>
              <h2 className="text-lg font-bold text-charcoal">Pending reviews</h2>
              <p className="text-xs text-muted-green mt-1">Finish these to strengthen your trust profile.</p>
            </div>
          </div>

          {pendingReviewsLoading ? (
            <div className="text-sm text-muted-green">Loading pending reviews...</div>
          ) : pendingReviewsError ? (
            <div className="text-sm text-red-600">Unable to load pending reviews.</div>
          ) : visiblePendingReviews.length === 0 ? (
            <div className="text-sm text-muted-green bg-gray-50 rounded-xl p-4">
              No pending reviews. You are all caught up.
            </div>
          ) : (
            <div className="space-y-3">
              {visiblePendingReviews.map((task) => (
                <div key={task.transactionId} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{task.listingTitle}</p>
                      <p className="text-xs text-muted-green mt-1">
                        Review for {task.ownerName}
                        <span className="mx-1.5">·</span>
                        Transaction #{task.transactionId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/discover/item/${task.listingId}`, {
                          state: {
                            reviewContext: {
                              transactionId: task.transactionId,
                              revieweeUserId: task.ownerUserId,
                              listingId: task.listingId,
                            },
                          },
                        })}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90"
                      >
                        Leave review
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.MARKETPLACE_EXCHANGES)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-charcoal hover:bg-gray-100"
                      >
                        View exchange
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
