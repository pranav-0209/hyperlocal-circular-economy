import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import HomeNavbar from '../components/ui/HomeNavbar';
import AppFooter from '../components/ui/AppFooter';
import MarketplaceSectionNav from '../components/ui/MarketplaceSectionNav';
import { ROUTES } from '../constants';
import {
  approveBorrowRequest,
  cancelBorrowRequest,
  completeBorrowRequest,
  getIncomingRequests,
  getMySentRequests,
  rejectBorrowRequest,
} from '../services/marketplaceService';

const requestBadgeStyle = (status) => {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'PENDING') return 'border-amber-200 text-amber-700 bg-amber-50';
  if (normalized === 'APPROVED') return 'border-green-200 text-green-700 bg-green-50';
  if (normalized === 'COMPLETED') return 'border-blue-200 text-blue-700 bg-blue-50';
  if (normalized === 'CANCELLED' || normalized === 'REJECTED') return 'border-gray-200 text-gray-600 bg-gray-50';
  return 'border-gray-200 text-charcoal bg-gray-50';
};

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

export default function MarketplaceRequestsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('incoming');
  const [completedRequestIds, setCompletedRequestIds] = useState([]);

  const { data: incomingRequests = [], isLoading: incomingLoading } = useQuery({
    queryKey: ['incomingRequests'],
    queryFn: () => getIncomingRequests({ page: 0, size: 30 }),
  });

  const { data: sentRequests = [], isLoading: sentLoading } = useQuery({
    queryKey: ['sentRequests'],
    queryFn: () => getMySentRequests({ page: 0, size: 30 }),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['incomingRequests'] });
    queryClient.invalidateQueries({ queryKey: ['sentRequests'] });
  };

  const approveMutation = useMutation({
    mutationFn: (requestId) => approveBorrowRequest(requestId),
    onSuccess: () => {
      toast.success('Request approved.');
      refresh();
    },
    onError: (error) => toast.error(error.message || 'Failed to approve request.'),
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId) => rejectBorrowRequest(requestId),
    onSuccess: () => {
      toast.success('Request rejected.');
      refresh();
    },
    onError: (error) => toast.error(error.message || 'Failed to reject request.'),
  });

  const completeMutation = useMutation({
    mutationFn: (requestId) => completeBorrowRequest(requestId),
    onSuccess: (updatedRequest, requestId) => {
      const completedId = String(updatedRequest?.id ?? requestId ?? '');
      if (completedId) {
        setCompletedRequestIds((prev) => (prev.includes(completedId) ? prev : [...prev, completedId]));
      }
      toast.success('Request marked complete.');
      refresh();
    },
    onError: (error) => toast.error(error.message || 'Failed to mark request complete.'),
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId) => cancelBorrowRequest(requestId),
    onSuccess: () => {
      toast.success('Request cancelled.');
      refresh();
    },
    onError: (error) => toast.error(error.message || 'Failed to cancel request.'),
  });

  const isLoading = tab === 'incoming' ? incomingLoading : sentLoading;
  const requests = tab === 'incoming' ? incomingRequests : sentRequests;

  const getEffectiveRequestStatus = (request) => {
    const normalized = String(request?.status || '').toUpperCase();
    const exchangeStatus = String(request?.exchangeStatus || '').toUpperCase();
    const requestId = String(request?.id || '');

    if (requestId && completedRequestIds.includes(requestId)) return 'COMPLETED';
    if (normalized === 'COMPLETED') return 'COMPLETED';
    if (exchangeStatus === 'COMPLETED') return 'COMPLETED';
    if (normalized === 'APPROVED' && (request?.completedAt || request?.returnedAt || request?.actualReturnDate)) {
      return 'COMPLETED';
    }

    return normalized || 'PENDING';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      <div className="pt-16 bg-white border-b border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-1.5 text-sm text-muted-green">
          <button onClick={() => navigate(ROUTES.MARKETPLACE_ACTIVITY)} className="hover:text-primary transition-colors">My Activity</button>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-charcoal font-semibold">Requests</span>
        </div>
      </div>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 pb-8 flex-1 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-charcoal">Requests</h1>
          <p className="text-sm text-muted-green">Handle incoming requests and monitor requests you have sent.</p>
        </div>

        <MarketplaceSectionNav />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl p-1.5 mb-5">
            <button
              type="button"
              onClick={() => setTab('incoming')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'incoming' ? 'bg-white text-charcoal shadow-sm' : 'text-muted-green hover:text-charcoal'}`}
            >
              Incoming ({incomingRequests.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('sent')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'sent' ? 'bg-white text-charcoal shadow-sm' : 'text-muted-green hover:text-charcoal'}`}
            >
              Sent ({sentRequests.length})
            </button>
          </div>

          {isLoading ? (
            <div className="text-sm text-muted-green">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-sm text-muted-green bg-gray-50 rounded-xl p-4">No {tab} requests yet.</div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => {
                const status = getEffectiveRequestStatus(request);

                return (
                  <div key={request.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-charcoal">{request.listingTitle || 'Listing'}</p>
                        <p className="text-xs text-muted-green mt-1">
                          {formatRequestDate(request.startDate)} - {formatRequestDate(request.endDate)}
                        </p>
                        <p className="text-xs text-muted-green mt-1">
                          {tab === 'incoming'
                            ? `Requester: ${request.requesterName || request.requesterId || 'Community member'}`
                            : `Owner: ${request.ownerName || request.ownerId || 'Community member'}`}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border pointer-events-none select-none cursor-default ${requestBadgeStyle(status)}`}>
                        {status}
                      </span>
                    </div>

                    {request.message && <p className="text-sm text-charcoal mt-3">{request.message}</p>}

                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      {tab === 'incoming' && status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            onClick={() => approveMutation.mutate(request.id)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectMutation.mutate(request.id)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {tab === 'incoming' && status === 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => completeMutation.mutate(request.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Mark Completed
                        </button>
                      )}

                      {tab === 'sent' && status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => cancelMutation.mutate(request.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
