import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';
import StatusBadge from '../../components/superadmin/StatusBadge';
import DocumentViewer from '../../components/superadmin/DocumentViewer';

/**
 * SuperAdminVerificationDetail Page (/superadmin/verifications/:id)
 * Detailed view of a user's verification request with approve/reject actions
 */
export default function SuperAdminVerificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Mock user data - In real app, fetch by id from backend
  const user = {
    id: id,
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 98765 43210',
    address: 'Koramangala, Bangalore',
    bio: 'I love gardening and have plenty of tools to share with the neighborhood. Also interested in book exchanges and community events.',
    profilePhoto: null,
    status: 'pending',
    submittedAt: '2 hours ago',
    registeredAt: 'Jan 28, 2026',
    documents: [
      {
        type: 'Aadhaar Card',
        url: 'https://placehold.co/800x500/e2e8f0/64748b?text=Aadhaar+Card',
        uploadedAt: '2 hours ago',
      },
      {
        type: 'Address Proof',
        url: 'https://placehold.co/800x500/e2e8f0/64748b?text=Address+Proof',
        uploadedAt: '2 hours ago',
      },
    ],
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    alert('User verified successfully!');
    navigate('/superadmin/verifications');
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    alert('Verification rejected. User will be notified.');
    navigate('/superadmin/verifications');
  };

  return (
    <SuperAdminLayout title="Review Verification">
      {/* Back Button */}
      <button
        onClick={() => navigate('/superadmin/verifications')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Verifications
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <div className="mt-3">
                <StatusBadge status={user.status} />
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400">phone</span>
                <span className="text-gray-700">{user.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400">location_on</span>
                <span className="text-gray-700">{user.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400">calendar_today</span>
                <span className="text-gray-700">Registered {user.registeredAt}</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">About</h3>
            <p className="text-gray-600 text-sm">{user.bio}</p>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">Documents Submitted</p>
                  <p className="text-xs text-gray-500">{user.submittedAt}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 animate-pulse"></div>
                <div>
                  <p className="text-sm text-gray-900">Pending Review</p>
                  <p className="text-xs text-gray-500">Awaiting admin action</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Uploaded Documents ({user.documents.length})
            </h3>
            <DocumentViewer documents={user.documents} />
          </div>

          {/* Verification Checklist */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Verification Checklist</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-gray-700">ID document is clear and readable</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-gray-700">Name matches profile information</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-gray-700">Address proof is valid</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-gray-700">No signs of document tampering</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Take Action</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined">check_circle</span>
                )}
                Approve Verification
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined">cancel</span>
                Reject
              </button>
              <button
                onClick={() => navigate('/superadmin/verifications')}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600">warning</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Reject Verification</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejection. This will be sent to the user via email.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Document is blurry and unreadable. Please re-upload a clearer image."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
