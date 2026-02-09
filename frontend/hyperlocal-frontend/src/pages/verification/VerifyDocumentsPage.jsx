import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VerificationLayout from '../../components/ui/VerificationLayout';
import DocumentUpload from '../../components/ui/DocumentUpload';
import SubmitButton from '../../components/ui/SubmitButton';
import { uploadDocuments } from '../../services/authService';

/**
 * VerifyDocumentsPage (/verify/documents)
 * 
 * Step 2 of verification: Upload identity documents
 * - Government ID
 * - Address proof
 */
export default function VerifyDocumentsPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState({
    governmentId: null,
    addressProof: null,
  });
  const [errors, setErrors] = useState({});

  const handleFileUpload = (documentType, file) => {
    setDocuments((prev) => ({
      ...prev,
      [documentType]: file,
    }));
    if (errors[documentType]) {
      setErrors((prev) => ({
        ...prev,
        [documentType]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!documents.governmentId) {
      newErrors.governmentId = 'Government ID is required';
    }

    // addressProof is optional

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append('governmentId', documents.governmentId);
      if (documents.addressProof) {
        formData.append('addressProof', documents.addressProof);
      }

      // Call backend API to upload documents
      const response = await uploadDocuments(formData);
      console.log('Documents upload response:', response);

      // Sync profile completion and currentStep from backend response
      updateUser({
        profileCompletion: response.profileCompletionPercentage,
        currentStep: response.currentStep,
        pendingSteps: response.pendingSteps || [],
        hasSubmittedDocuments: true,
      });

      // Navigate to pending review page
      navigate('/verify/pending');
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to upload documents' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VerificationLayout stepNumber={2} totalSteps={3} title="Verify your Identity">
      <div className="max-w-3xl mx-auto bg-white rounded-lg p-8 border border-gray-200">
        <p className="text-charcoal mb-8">
          Please upload clear photos or scans of the following documents. This usually takes less
          than 2 minutes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Government ID Upload */}
          <DocumentUpload
            title="Government ID"
            description="Passport, Driver's License or National ID"
            acceptedFormats="image/*, .pdf"
            onFileSelected={(file) => handleFileUpload('governmentId', file)}
            selectedFile={documents.governmentId}
            error={errors.governmentId}
            icon="badge"
          />

          {/* Address Proof Upload */}
          <DocumentUpload
            title="Address Proof (Optional)"
            description="Utility Bill, Bank Statement (Max 5MB)"
            acceptedFormats="image/*, .pdf"
            onFileSelected={(file) => handleFileUpload('addressProof', file)}
            selectedFile={documents.addressProof}
            error={errors.addressProof}
            icon="home"
          />

          {/* Security Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 flex items-start gap-2">
            <span className="material-symbols-outlined shrink-0 text-lg mt-0.5">lock</span>
              Your documents are encrypted and reviewed by admins only. We never share your personal
              data.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/verify/profile')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-charcoal font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <SubmitButton
              text="Submit for Verification"
              isLoading={isLoading}
              className="ml-auto"
            />
          </div>
        </form>
      </div>
    </VerificationLayout>
  );
}
