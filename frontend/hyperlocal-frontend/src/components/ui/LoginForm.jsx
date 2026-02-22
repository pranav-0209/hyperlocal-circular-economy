import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/AuthContext';
import { loginUser, saveAuthData } from '../../services/authService';
import { loginSchema } from '../../schemas/authSchemas';
import { ROUTES } from '../../constants';
import { toast } from 'sonner';

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  // eslint-disable-next-line no-unused-vars -- setRejectionDetails kept for future wiring when REJECTED status returns modal
  const [rejectionDetails, setRejectionDetails] = useState({ reason: '', email: '' });

  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(data) {
    try {
      const response = await loginUser({
        email: data.email,
        password: data.password,
      });

      console.log('Login successful:', response);

      // Save token to localStorage
      saveAuthData(response.token, null);

      // Set user in context from backend response
      // hasCommunities: backend should send communityCount (int) in login response.
      // We use it as a hint so DashboardPage can block until useMyCommunities fetches real data,
      // preventing the "Select your path" screen from flashing for users who already have communities.
      login({
        id: response.userId,
        email: response.email,
        name: response.name,
        role: response.role,
        isVerified: response.status === 'VERIFIED',
        profileCompletion: response.profileCompletionPercentage,
        currentStep: response.currentStep,
        pendingSteps: response.pendingSteps || [],
        hasSubmittedDocuments: response.status === 'REJECTED'
          ? false
          : !response.pendingSteps?.includes('UPLOAD_DOCUMENTS'),
        verificationStatus: response.status,
        rejectionReason: response.rejectionReason,
        // If backend sends communityCount, use it; fallback to 0 (safe default)
        hasCommunities: (response.communityCount ?? 0) > 0,
        communities: [],
        profile: {
          name: response.name,
          phone: '',
          address: '',
          bio: ''
        }
      });

      // Check if user's verification was rejected
      if (response.status === 'REJECTED') {
        // Just navigate to home with rejection info in context
        navigate(ROUTES.HOME);
        return;
      }

      // Navigate based on verification status
      if (response.status === 'VERIFIED') {
        navigate(ROUTES.DASHBOARD);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (error) {
      console.error('Login error:', error);
      // 401 from the login endpoint means wrong credentials, not "session expired"
      const message =
        error.statusCode === 401
          ? 'Invalid email or password. Please try again.'
          : error.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      form.setError('root', {
        type: 'manual',
        message,
      });
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center lg:text-left">
        <h1 className="font-heading text-3xl font-bold mb-2 text-charcoal">Welcome back</h1>
        <p className="text-muted-green text-sm">
          New to ShareMore? <a className="text-primary font-bold hover:underline" href={ROUTES.REGISTER}>Create an account</a>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">
                      mail
                    </span>
                    <Input placeholder="your@email.com" type="email" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex justify-between items-center">
                  <span>Password</span>
                  {/* <a href="#" className="font-normal text-xs text-primary hover:underline">Forgot password?</a> */}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">
                      lock
                    </span>
                    <Input placeholder="••••••••" type="password" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Global Error */}
          {form.formState.errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-lg mt-0.5">error</span>
              <span>{form.formState.errors.root.message}</span>
            </div>
          )}

          <Button type="submit" className="w-full py-6 font-bold text-base" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>

      {/* Security Notice */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-4">
        <p className="text-xs text-muted-green/70 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">lock</span>
          Your account is protected with encryption
        </p>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 mx-auto rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-red-600">cancel</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verification Rejected</h3>
              <p className="text-gray-600 mb-6">{rejectionDetails.reason}</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-yellow-600 text-sm">info</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-yellow-900 mb-1">What's next?</p>
                    <p className="text-sm text-yellow-800">
                      You can update your documents and resubmit for verification from your home page.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  navigate(ROUTES.HOME);
                }}
                className="w-full px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                Continue to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
