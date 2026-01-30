import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from './FormInput';
import FormCheckbox from './FormCheckbox';
import ErrorAlert from './ErrorAlert';
import SubmitButton from './SubmitButton';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(data.email)) newErrors.email = 'Invalid email';
    if (!data.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleLogin = async (data) => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Login:', data);
    
    // For testing: Use email to determine user type
    // - Use "verified@test.com" for verified user with community (goes to dashboard)
    // - Any other email for new unverified user (goes to home/verification flow)
    
    const isVerifiedUser = data.email.toLowerCase().includes('verified');
    
    if (isVerifiedUser) {
      // VERIFIED USER - Has completed verification and joined a community
      login({
        id: 'verified-user-123',
        email: data.email,
        isVerified: true,
        profileCompletion: 100,
        role: 'USER',
        hasSubmittedDocuments: true,
        communities: [
          { id: 'comm-1', name: 'North Maplewood', memberCount: 234, role: 'member' }
        ],
        profile: {
          name: 'Alex Johnson',
          phone: '+1 555-0123',
          address: '123 Maple Street, Brooklyn, NY',
          bio: 'Love sharing tools and gardening equipment with neighbors!'
        }
      });
      navigate('/dashboard');
    } else {
      // NEW/UNVERIFIED USER - Needs to complete verification
      login({
        id: 'new-user-' + Date.now(),
        email: data.email,
        isVerified: false,
        profileCompletion: 20,
        role: 'USER',
        hasSubmittedDocuments: false,
        communities: [],
        profile: {
          name: '',
          phone: '',
          address: '',
          bio: ''
        }
      });
      navigate('/home');
    }
  };

  const form = useForm(
    { email: '', password: '', rememberMe: false },
    handleLogin,
    validateForm
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center lg:text-left">
        <h1 className="font-heading text-3xl font-bold mb-2 text-charcoal">Welcome back</h1>
        <p className="text-muted-green text-sm">
          New to ShareMore? <a className="text-primary font-bold hover:underline" href="/register">Create an account</a>
        </p>
      </div>

      {/* Test Mode Notice */}
      <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-xs text-muted-green">
          <strong className="text-charcoal">Test Mode:</strong> Use <code className="bg-white px-1 rounded">verified@test.com</code> for verified user (→ Dashboard), or any other email for new user (→ Verification flow)
        </p>
      </div>

      {/* Error Alert */}
      <ErrorAlert message={form.errors.submit} />

      {/* Form */}
      <form className="space-y-5" onSubmit={form.handleSubmit}>
        {/* Email */}
        <FormInput
          label="Email"
          name="email"
          type="email"
          icon="mail"
          value={form.formData.email}
          onChange={form.handleChange}
          placeholder="your@email.com"
          error={form.errors.email}
          ariaLabel="Email address"
        />

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-green">
              Password
            </label>
            <a href="/forgot-password" className="text-primary font-bold hover:underline text-xs">
              Forgot password?
            </a>
          </div>
          <FormInput
            name="password"
            type="password"
            icon="lock"
            value={form.formData.password}
            onChange={form.handleChange}
            placeholder="••••••••"
            error={form.errors.password}
            ariaLabel="Password"
          />
        </div>

        {/* Remember Me */}
        {/* <FormCheckbox
          id="rememberMe"
          checked={form.formData.rememberMe}
          onChange={form.handleChange}
          label="Keep me signed in for 30 days"
          ariaLabel="Remember me"
        /> */}

        {/* Submit Button */}
        <div className="pt-3">
          <SubmitButton
            loading={form.loading}
            label="Sign In"
            loadingLabel="Signing in..."
          />
        </div>
      </form>

      {/* Security Notice */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-4">
        <p className="text-xs text-muted-green/70 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">lock</span>
          Your account is protected with encryption
        </p>
        <p className="text-xs text-muted-green/60">
          Don't have an account? <a href="/register" className="text-primary font-bold hover:underline">Sign up here</a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
