import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VerificationLayout from '../../components/ui/VerificationLayout';
import FormInput from '../../components/ui/FormInput';
import SubmitButton from '../../components/ui/SubmitButton';

/**
 * VerifyProfilePage (/verify/profile)
 * 
 * Step 1 of verification: Collect profile details
 * - Full name
 * - Phone number
 * - Address
 * - Short bio
 */
export default function VerifyProfilePage() {
  const navigate = useNavigate();
  const { updateProfileCompletion } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    bio: '',
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photo: 'Image must be less than 5MB' }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, photo: 'Please upload an image file' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        setErrors((prev) => ({ ...prev, photo: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10,}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Please tell us about yourself';
    } else if (formData.bio.length < 10) {
      newErrors.bio = 'Bio must be at least 10 characters';
    }

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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update profile completion
    updateProfileCompletion(40);

    // Navigate to document upload
    navigate('/verify/documents');
  };

  return (
    <VerificationLayout stepNumber={1} totalSteps={3} title="Build Your Profile">
      <div className="max-w-3xl mx-auto bg-white rounded-lg p-8 border border-gray-200">
        <p className="text-charcoal mb-6">
          ShareMore relies on real people. Please provide accurate details to get verified and start
          sharing with your neighbors.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-start gap-6">
              <div className="shrink-0">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-gray-400 text-4xl">
                      person
                    </span>
                  )}
                </div>
              </div>
              <div className="grow">
                <h3 className="font-semibold text-charcoal mb-2">Profile Photo</h3>
                <p className="text-sm text-muted-green mb-3">
                  Upload a clear photo of yourself so neighbors can recognize you when you meet.
                </p>
                <input
                  type="file"
                  id="profilePhoto"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="profilePhoto"
                  className="text-primary hover:text-primary/80 font-medium text-sm cursor-pointer"
                >
                  {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                </label>
                {errors.photo && (
                  <p className="text-red-500 text-xs mt-1">{errors.photo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <FormInput
            label="Full Legal Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. Priya Sharma"
            error={errors.fullName}
            icon="person"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              error={errors.phoneNumber}
              icon="phone"
              type="tel"
            />

            <FormInput
              label="City / Area"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Pune, Maharashtra"
              error={errors.address}
              icon="location_on"
            />
          </div>

          {/* Bio Textarea */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              About You
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 material-symbols-outlined text-gray-400 text-xl">
                description
              </span>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="I love gardening and have plenty of tools to share with the neighborhood..."
                rows="4"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-charcoal placeholder-gray-400 focus:ring-2 focus:ring-primary"
              />
              <div className="flex justify-between mt-2">
                <span className={`text-xs ${errors.bio ? 'text-red-500' : 'text-muted-green'}`}>
                  {errors.bio || 'This will be visible on your public profile'}
                </span>
                <span className="text-xs text-muted-green">
                  {formData.bio.length}/200
                </span>
              </div>
            </div>
          </div>

          {/* Security Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 flex items-start gap-2">
              <span className="material-symbols-outlined shrink-0 text-lg mt-0.5">lock</span>
              Your information is securely encrypted and never shared without permission.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-charcoal font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <SubmitButton
              text="Save & Continue"
              isLoading={isLoading}
              className="ml-auto"
            />
          </div>
        </form>
      </div>
    </VerificationLayout>
  );
}
