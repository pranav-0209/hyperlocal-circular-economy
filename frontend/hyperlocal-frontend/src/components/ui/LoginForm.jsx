import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from './FormInput';
import FormCheckbox from './FormCheckbox';
import ErrorAlert from './ErrorAlert';
import SubmitButton from './SubmitButton';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../context/AuthContext';
import { loginUser, saveAuthData } from '../../services/authService';

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
    try {
      // Call the real API
      const response = await loginUser({
        email: data.email,
        password: data.password,
      });

      console.log('Login successful:', response);

      // Save token to localStorage
      saveAuthData(response.token, null);

      // Set user in context from backend response
      login({
        id: response.userId,
        email: response.email,
        name: response.name,
        role: response.role,
        isVerified: response.currentStep === 'COMPLETE',
        profileCompletion: response.profileCompletionPercentage,
        currentStep: response.currentStep,
        pendingSteps: response.pendingSteps || [],
        hasSubmittedDocuments: !response.pendingSteps?.includes('UPLOAD_DOCUMENTS'),
        communities: [],
        profile: {
          name: response.name,
          phone: '',
          address: '',
          bio: ''
        }
      });

      // Navigate based on user's current step
      if (response.currentStep === 'COMPLETE') {
        // Fully verified user - go to dashboard
        navigate('/dashboard');
      } else {
        // All other users go to home page first
        // They can then click to continue verification from there
        navigate('/home');
      }
    } catch (error) {
      throw error;
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
