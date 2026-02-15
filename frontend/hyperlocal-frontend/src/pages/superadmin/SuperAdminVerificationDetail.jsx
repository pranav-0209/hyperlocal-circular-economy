import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import SuperAdminLayout from '../../components/superadmin/SuperAdminLayout';
import StatusBadge from '../../components/superadmin/StatusBadge';
import DocumentViewer from '../../components/superadmin/DocumentViewer';
import { getUserById, verifyUser } from '../../services/authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * SuperAdminVerificationDetail Page (/superadmin/verifications/:id)
 * Detailed view of a user's verification request with approve/reject actions
 */
export default function SuperAdminVerificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectValidationError, setRejectValidationError] = useState('');
  const [user, setUser] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState(''); // 'approve' or 'reject'
  const [checklist, setChecklist] = useState({
    documentClear: false,
    nameMatches: false,
    addressValid: false,
    noTampering: false,
  });
  const isFetchingRef = useRef(false);

  // Fetch user details from backend
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isFetchingRef.current) {
        console.log('Fetch already in progress, skipping...');
        return;
      }
      
      isFetchingRef.current = true;
      setIsLoading(true);
      try {
        const response = await getUserById(id);
        console.log('User details:', response);
        setUser(response);
        
        // Load profile photo with authentication if available
        if (response.profilePhotoUrl) {
          loadAuthenticatedImage(response.profilePhotoUrl);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setModalMessage('Failed to load user details. Please try again.');
        setShowErrorModal(true);
        setTimeout(() => navigate('/superadmin/verifications'), 2000);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchUserDetails();
  }, [id, navigate]);

  // Load authenticated image
  const loadAuthenticatedImage = async (photoUrl) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      // Check if URL is already absolute or relative
      const fullUrl = photoUrl.startsWith('http') ? photoUrl : `${API_BASE_URL}${photoUrl}`;
      
      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setProfilePhotoUrl(objectUrl);
      } else {
        console.error('Failed to load profile photo:', response.status);
      }
    } catch (error) {
      console.error('Error loading profile photo:', error);
    }
  };

  // Cleanup profile photo URL on unmount
  useEffect(() => {
    return () => {
      if (profilePhotoUrl) {
        URL.revokeObjectURL(profilePhotoUrl);
      }
    };
  }, [profilePhotoUrl]);

  const handleApproveClick = () => {
    if (!user.governmentIdUrl) {
      setModalMessage('Cannot approve: User has not uploaded required documents yet.');
      setShowErrorModal(true);
      return;
    }
    
    // Check if all checklist items are checked
    const allChecked = Object.values(checklist).every(item => item === true);
    if (!allChecked) {
      setModalMessage('Please verify all checklist items before approving.');
      setShowErrorModal(true);
      return;
    }
    
    // Show confirmation modal
    setShowApproveModal(true);
  };

  const confirmApproval = async () => {
    setShowApproveModal(false);
    setIsProcessing(true);
    try {
      const response = await verifyUser(id, { approved: true });
      console.log('Approval response:', response);
      setModalMessage(response.message || 'Verification approved successfully!');
      setModalType('approve');
      setShowSuccessModal(true);
      // Invalidate queries to refresh verification list
      queryClient.invalidateQueries({ queryKey: ['verifications'] });
      queryClient.invalidateQueries({ queryKey: ['verification-stats'] });
      queryClient.invalidateQueries({ queryKey: ['verified-users'] });
      // Auto-navigate after 2.5 seconds
      setTimeout(() => navigate('/superadmin/verifications'), 2500);
    } catch (error) {
      console.error('Error approving verification:', error);
      setModalMessage(error.message || 'Failed to approve verification. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!user.governmentIdUrl) {
      setModalMessage('Cannot reject: User has not uploaded required documents yet.');
      setShowErrorModal(true);
      return;
    }
    
    if (!rejectReason.trim()) {
      setRejectValidationError('Please provide a reason for rejection');
      return;
    }
    setRejectValidationError('');
    setIsProcessing(true);
    try {
      const response = await verifyUser(id, {
        approved: false,
        rejectionReason: rejectReason,
      });
      console.log('Rejection response:', response);
      setShowRejectModal(false);
      setModalMessage(response.message || 'Verification rejected successfully!');
      setModalType('reject');
      setShowSuccessModal(true);
      // Invalidate queries to refresh verification list
      queryClient.invalidateQueries({ queryKey: ['verifications'] });
      queryClient.invalidateQueries({ queryKey: ['verification-stats'] });
      queryClient.invalidateQueries({ queryKey: ['verified-users'] });
      // Auto-navigate after 2.5 seconds
      setTimeout(() => navigate('/superadmin/verifications'), 2500);
    } catch (error) {
      console.error('Error rejecting verification:', error);
      setShowRejectModal(false);
      setModalMessage(error.message || 'Failed to reject verification. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <SuperAdminLayout title="Review Verification">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
            <p className="text-gray-600 mt-4">Loading user details...</p>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  if (!user) {
    return (
      <SuperAdminLayout title="Review Verification">
        <div className="text-center py-12">
          <p className="text-gray-600">User not found</p>
          <button
            onClick={() => navigate('/superadmin/verifications')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
          >
            Back to Verifications
          </button>
        </div>
      </SuperAdminLayout>
    );
  }

  // Map backend data to display format
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || 'N/A',
    address: user.address || 'Not provided',
    bio: user.aboutMe || 'No bio provided',
    profilePhoto: profilePhotoUrl, // Use authenticated URL from state
    status: user.verificationStatus?.toLowerCase() || 'not_verified',
    submittedAt: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) : 'N/A',
    registeredAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) : 'N/A',
    community: user.community || 'Not assigned',
    documents: [
      user.governmentIdUrl && {
        type: 'Government ID',
        url: user.governmentIdUrl.startsWith('http') ? user.governmentIdUrl : `${API_BASE_URL}${user.governmentIdUrl}`,
        uploadedAt: user.updatedAt,
      },
      user.addressProofUrl && {
        type: 'Address Proof',
        url: user.addressProofUrl.startsWith('http') ? user.addressProofUrl : `${API_BASE_URL}${user.addressProofUrl}`,
        uploadedAt: user.updatedAt,
      },
    ].filter(Boolean),
  };

  const hasDocuments = userData.documents.length > 0;
  const allChecklistItemsChecked = Object.values(checklist).every(item => item === true);

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
                {userData.profilePhoto ? (
                  <img src={userData.profilePhoto} alt={userData.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
              <p className="text-gray-500">{userData.email}</p>
              <div className="mt-3">
                <StatusBadge status={userData.status} />
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400">phone</span>
                <span className="text-gray-700">{userData.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400">location_on</span>
                <span className="text-gray-700">{userData.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400">location_city</span>
                <span className="text-gray-700">{userData.community}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400">calendar_today</span>
                <span className="text-gray-700">Registered {userData.registeredAt}</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">About</h3>
            <p className="text-gray-600 text-sm">{userData.bio}</p>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              {/* Completed: Registration */}
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">Account Created</p>
                  <p className="text-xs text-gray-500">{userData.registeredAt}</p>
                </div>
              </div>

              {/* Dynamic steps based on currentStep */}
              {user.currentStep !== 'PROFILE' && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Profile Completed</p>
                    <p className="text-xs text-gray-500">
                      {user.currentStep === 'DOCUMENT_VERIFICATION' || user.currentStep === 'REVIEW' || user.currentStep === 'COMPLETE'
                        ? userData.submittedAt
                        : 'Completed'}
                    </p>
                  </div>
                </div>
              )}

              {user.currentStep === 'DOCUMENT_VERIFICATION' && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 animate-pulse"></div>
                  <div>
                    <p className="text-sm text-gray-900">Document Upload</p>
                    <p className="text-xs text-gray-500">Waiting for documents</p>
                  </div>
                </div>
              )}

              {(user.currentStep === 'REVIEW' || user.currentStep === 'COMPLETE') && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Documents Submitted</p>
                    <p className="text-xs text-gray-500">{userData.submittedAt}</p>
                  </div>
                </div>
              )}

              {user.currentStep === 'REVIEW' && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 animate-pulse"></div>
                  <div>
                    <p className="text-sm text-gray-900">Under Review</p>
                    <p className="text-xs text-gray-500">Awaiting admin action</p>
                  </div>
                </div>
              )}

              {user.currentStep === 'PROFILE' && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 animate-pulse"></div>
                  <div>
                    <p className="text-sm text-gray-900">Profile Pending</p>
                    <p className="text-xs text-gray-500">Awaiting profile completion</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Uploaded Documents ({userData.documents.length})
            </h3>
            {userData.documents.length > 0 ? (
              <DocumentViewer documents={userData.documents} />
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">description</span>
                <p className="text-gray-500 font-medium">No documents uploaded yet</p>
                <p className="text-gray-400 text-sm mt-1">User needs to complete document upload step</p>
              </div>
            )}
          </div>

          {/* Verification Checklist */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Verification Checklist
              {/* <span className="text-sm text-red-600 ml-2">* Required for approval</span> */}
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={checklist.documentClear}
                  onChange={(e) => setChecklist({...checklist, documentClear: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <span className="text-gray-700">ID document is clear and readable</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={checklist.nameMatches}
                  onChange={(e) => setChecklist({...checklist, nameMatches: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <span className="text-gray-700">Name matches profile information</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={checklist.addressValid}
                  onChange={(e) => setChecklist({...checklist, addressValid: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <span className="text-gray-700">Address proof is valid</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={checklist.noTampering}
                  onChange={(e) => setChecklist({...checklist, noTampering: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <span className="text-gray-700">No signs of document tampering</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Take Action</h3>
            
            {!hasDocuments && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-yellow-600 text-xl">info</span>
                <p className="text-sm text-yellow-800">
                  <strong>Documents Required:</strong> User must upload verification documents before you can approve or reject.
                </p>
              </div>
            )}
            
            {hasDocuments && !allChecklistItemsChecked && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-blue-600 text-xl">info</span>
                <p className="text-sm text-blue-800">
                  <strong>Checklist Required:</strong> Please verify all checklist items above before approving.
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleApproveClick}
                disabled={isProcessing || !hasDocuments || !allChecklistItemsChecked}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={
                  !hasDocuments 
                    ? 'Documents required to approve' 
                    : !allChecklistItemsChecked 
                    ? 'Complete all checklist items to approve' 
                    : ''
                }
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
                disabled={isProcessing || !hasDocuments}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={!hasDocuments ? 'Documents required to reject' : ''}
              >
                <span className="material-symbols-outlined">cancel</span>
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                modalType === 'approve' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className={`material-symbols-outlined text-4xl ${
                  modalType === 'approve' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {modalType === 'approve' ? 'check_circle' : 'cancel'}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {modalType === 'approve' ? 'Verification Approved!' : 'Verification Rejected'}
              </h3>
              <p className="text-gray-600 mb-6">{modalMessage}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                <span>Redirecting to verifications list...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 mx-auto rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-red-600">error</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-6">{modalMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Approve Verification</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to verify <strong>{user?.name}</strong>? This will grant them full access to the platform.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-green-600 text-sm">info</span>
                <p className="text-sm text-green-800">
                  The user will receive a confirmation email and can start using all platform features.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmApproval}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

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
            
            {/* Validation Error */}
            {rejectValidationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-red-600 text-sm">error</span>
                <p className="text-sm text-red-800">{rejectValidationError}</p>
              </div>
            )}
            
            <textarea
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                if (rejectValidationError) setRejectValidationError('');
              }}
              placeholder="e.g., Document is blurry and unreadable. Please re-upload a clearer image."
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none ${
                rejectValidationError ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setRejectValidationError('');
                }}
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
