import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import HomeNavbar from '../components/ui/HomeNavbar';
import AppFooter from '../components/ui/AppFooter';
import MarketplaceSectionNav from '../components/ui/MarketplaceSectionNav';
import { ROUTES } from '../constants';
import { getIncomingRequests, getMySentRequests } from '../services/marketplaceService';

const formatRequestDate = (dateValue) => {
  if (!dateValue) return '';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const statusStyle = (status) => {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'APPROVED') return 'bg-green-50 text-green-700 border-green-200';
  if (normalized === 'COMPLETED') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

export default function MarketplaceExchangesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('borrowed');

  const { data: incomingRequests = [], isLoading: incomingLoading } = useQuery({
    queryKey: ['incomingRequests'],
    queryFn: () => getIncomingRequests({ page: 0, size: 40 }),
  });

  const { data: sentRequests = [], isLoading: sentLoading } = useQuery({
    queryKey: ['sentRequests'],
    queryFn: () => getMySentRequests({ page: 0, size: 40 }),
  });

  const borrowedItems = useMemo(
    () => sentRequests.filter((request) => ['APPROVED', 'COMPLETED'].includes(request.status)),
    [sentRequests]
  );

  const lentItems = useMemo(
    () => incomingRequests.filter((request) => ['APPROVED', 'COMPLETED'].includes(request.status)),
    [incomingRequests]
  );

  const data = tab === 'borrowed' ? borrowedItems : lentItems;
  const isLoading = tab === 'borrowed' ? sentLoading : incomingLoading;
  const tabHelpText = tab === 'borrowed'
    ? 'Items borrowed by you from other community members.'
    : 'Items lent by you to borrowers in your community.';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      <div className="pt-16 bg-white border-b border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-1.5 text-sm text-muted-green">
          <button onClick={() => navigate(ROUTES.MARKETPLACE_ACTIVITY)} className="hover:text-primary transition-colors">My Activity</button>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-charcoal font-semibold">Exchanges</span>
        </div>
      </div>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 pb-8 flex-1 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-charcoal">Exchanges</h1>
          <p className="text-sm text-muted-green">Track what you borrowed and what you lent in one place.</p>
        </div>

        <MarketplaceSectionNav />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl p-1.5 mb-5">
            <button
              type="button"
              onClick={() => setTab('borrowed')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'borrowed' ? 'bg-white text-charcoal shadow-sm' : 'text-muted-green hover:text-charcoal'}`}
            >
              Borrowed ({borrowedItems.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('lent')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'lent' ? 'bg-white text-charcoal shadow-sm' : 'text-muted-green hover:text-charcoal'}`}
            >
              Lent ({lentItems.length})
            </button>
          </div>

          <p className="text-xs text-muted-green mb-4">{tabHelpText}</p>

          {isLoading ? (
            <div className="text-sm text-muted-green">Loading exchanges...</div>
          ) : data.length === 0 ? (
            <div className="text-sm text-muted-green bg-gray-50 rounded-xl p-4">No {tab} items yet.</div>
          ) : (
            <div className="space-y-3">
              {data.map((exchange) => (
                <div key={exchange.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-charcoal">{exchange.listingTitle || 'Listing'}</p>
                      <p className="text-xs text-muted-green mt-1">
                        {formatRequestDate(exchange.startDate)} - {formatRequestDate(exchange.endDate)}
                      </p>
                      <p className="text-xs text-muted-green mt-1">
                        {tab === 'borrowed'
                          ? `Owner: ${exchange.ownerName || exchange.ownerId || 'Community member'}`
                          : `Borrower: ${exchange.requesterName || exchange.requesterId || 'Community member'}`}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle(exchange.status)}`}>
                      {exchange.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
