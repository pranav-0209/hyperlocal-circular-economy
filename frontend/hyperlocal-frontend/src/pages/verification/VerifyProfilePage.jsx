import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import VerificationLayout from '../../components/ui/VerificationLayout';
import SubmitButton from '../../components/ui/SubmitButton';
import { updateProfile } from '../../services/authService';
import { toast } from 'sonner';
import { profileSchema } from '../../schemas/verificationSchemas';
import { useDarkMode } from '../../hooks/useDarkMode';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const { user, updateUser } = useAuth();
  const { dark } = useDarkMode();
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null); // Actual file for upload
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null); // Preview URL

  // React Hook Form instance
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phoneNumber: '',
      address: '',
      bio: '',
    },
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      // Store actual file for upload
      setProfilePhotoFile(file);
      // Create preview URL
      setProfilePhotoPreview(URL.createObjectURL(file));
    }
  };

  // Removed manual validation - now handled by Zod schema

  const handleSubmit = async (data) => {
    setIsLoading(true);

    try {
      // Prepare FormData for multipart upload
      const formDataToSend = new FormData();
      formDataToSend.append('phone', data.phoneNumber);
      formDataToSend.append('address', data.address);
      formDataToSend.append('bio', data.bio);
      if (profilePhotoFile) {
        formDataToSend.append('profilePhoto', profilePhotoFile);
      }

      // Call backend API to update profile
      const response = await updateProfile(formDataToSend);

      console.log('Profile update response:', response);

      // Sync profile completion and currentStep from backend response
      updateUser({
        profileCompletion: response.profileCompletionPercentage,
        currentStep: response.currentStep,
        pendingSteps: response.pendingSteps || [],
      });

      // Show success toast
      toast.success('Profile updated successfully!', {
        description: 'Moving to document verification',
        duration: 3000,
      });

      // Navigate to document upload
      navigate('/verify/documents');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      // Show error toast
      toast.error('Failed to update profile', {
        description: error.message || 'Please try again',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VerificationLayout stepNumber={1} totalSteps={3} title="Build Your Profile">
      <div className={`rounded-xl p-6 border ${dark ? 'bg-white/6 border-white/12 shadow-black/20' : 'bg-white border-gray-200 shadow-sm'} backdrop-blur-sm`}>
        <p className="text-sm text-charcoal mb-4">
          ShareMore relies on real people. Please provide accurate details to get verified and start
          sharing with your neighbors.
        </p>

        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(handleSubmit)} className="space-y-5">
            {/* Profile Photo Section */}
            <div className={`mb-4 pb-4 border-b ${dark ? 'border-white/12' : 'border-gray-200'}`}>
              <div className="flex items-start gap-6">
                <div className="shrink-0">
                  <div className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden ${dark ? 'border-white/20 bg-white/8' : 'border-gray-300 bg-gray-50'}`}>
                    {profilePhotoPreview ? (
                      <img
                        src={profilePhotoPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className={`material-symbols-outlined text-4xl ${dark ? 'text-white/50' : 'text-gray-400'}`}>
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
                    {profilePhotoPreview ? 'Change Photo' : 'Upload Photo'}
                  </label>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fullName" className="text-sm font-medium text-charcoal">Full Name</label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl ${dark ? 'text-white/55' : 'text-gray-400'}`}>
                    person
                  </span>
                  <Input
                    id="fullName"
                    value={user?.name || user?.profile?.name || ''}
                    disabled
                    className={`pl-10 h-11 ${dark ? 'bg-white/8 border-white/12 text-charcoal' : 'bg-gray-50 border-gray-200 text-muted-green'} cursor-not-allowed`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-charcoal">Email Address</label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl ${dark ? 'text-white/55' : 'text-gray-400'}`}>
                    mail
                  </span>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className={`pl-10 h-11 ${dark ? 'bg-white/8 border-white/12 text-charcoal' : 'bg-gray-50 border-gray-200 text-muted-green'} cursor-not-allowed`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
              <FormField
                control={profileForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl ${dark ? 'text-white/55' : 'text-gray-400'}`}>
                          phone
                        </span>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="+91 98765 43210"
                          className={`pl-10 ${dark ? 'bg-white/8 border-white/12 text-charcoal placeholder:text-muted-green/70' : ''}`}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl ${dark ? 'text-white/55' : 'text-gray-400'}`}>
                          location_on
                        </span>
                        <Input
                          {...field}
                          placeholder="e.g. Pune, Maharashtra"
                          className={`pl-10 ${dark ? 'bg-white/8 border-white/12 text-charcoal placeholder:text-muted-green/70' : ''}`}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bio Textarea */}
            <FormField
              control={profileForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>About You</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className={`absolute left-3 top-3 material-symbols-outlined text-xl ${dark ? 'text-white/55' : 'text-gray-400'}`}>
                        description
                      </span>
                      <Textarea
                        {...field}
                        placeholder="I love gardening and have plenty of tools to share with the neighborhood..."
                        rows={4}
                        className={`pl-10 ${dark ? 'bg-white/8 border-white/12 text-charcoal placeholder:text-muted-green/70' : ''}`}
                      />
                    </div>
                  </FormControl>
                  <div className="flex justify-between">
                    <FormMessage />
                    <span className="text-xs text-muted-green">
                      {field.value.length}/500
                    </span>
                  </div>
                  <FormDescription>
                    This will be visible on your public profile
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Security Message */}
            <div className={`border rounded-lg p-4 ${dark ? 'bg-primary/12 border-primary/25' : 'bg-green-50 border-green-200'}`}>
              <p className={`text-sm flex items-start gap-2 ${dark ? 'text-muted-green' : 'text-green-700'}`}>
                <span className="material-symbols-outlined shrink-0 text-lg mt-0.5">lock</span>
                Your information is securely encrypted and never shared without permission.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-3">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className={`px-6 py-3 border rounded-lg text-charcoal font-medium transition-colors ${dark ? 'border-white/20 hover:bg-white/8' : 'border-gray-300 hover:bg-gray-50'}`}
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
        </Form>
      </div>
    </VerificationLayout>
  );
}
