import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from './FormInput';
import FormCheckbox from './FormCheckbox';
import ErrorAlert from './ErrorAlert';
import SubmitButton from './SubmitButton';
import { useForm } from '../../hooks/useForm';

const LoginForm = () => {
  const navigate = useNavigate();

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
    navigate('/dashboard');
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
