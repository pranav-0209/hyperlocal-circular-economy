import React, { useState } from 'react';
import FormInput from './FormInput';
import FormCheckbox from './FormCheckbox';
import ErrorAlert from './ErrorAlert';
import SubmitButton from './SubmitButton';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';

const RegisterForm = () => {
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!data.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(data.email)) newErrors.email = 'Invalid email';
    if (!data.password) newErrors.password = 'Password is required';
    else if (data.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (data.password !== data.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!data.agreed) newErrors.agreed = 'You must agree to terms';
    return newErrors;
  };

  const handleRegister = async (data) => {
    try {
      // Call the real API
      const response = await registerUser({
        name: data.fullName,
        email: data.email,
        password: data.password,
        agreeToTerms: data.agreed,
      });

      console.log('Registration successful:', response);

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      // Error is already formatted by the API interceptor
      throw error;
    }
  };

  const form = useForm(
    {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreed: false,
    },
    handleRegister,
    validateForm
  );


  if (success) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-charcoal">Welcome to ShareMore!</h2>
          <p className="text-muted-green text-base max-w-sm">
            Your account has been created successfully. Setting up your profile...
          </p>
        </div>
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mt-6">
          <div className="h-full bg-primary animate-pulse" style={{ width: '70%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center lg:text-left">
        <h1 className="font-heading text-3xl font-bold mb-2 text-charcoal">Create your account</h1>
        <p className="text-muted-green text-sm">
          Already part of the movement? <a className="text-primary font-bold hover:underline" href="/login">Log in here</a>
        </p>
      </div>

      {/* Error Alert */}
      <ErrorAlert message={form.errors.submit} />

      {/* Form */}
      <form className="space-y-4" onSubmit={form.handleSubmit}>
        {/* Full Name */}
        <FormInput
          label="Full Name"
          name="fullName"
          type="text"
          icon="person"
          value={form.formData.fullName}
          onChange={form.handleChange}
          placeholder="e.g. Priya Sharma"
          error={form.errors.fullName}
          ariaLabel="Full name"
        />

        {/* Email */}
        <FormInput
          label="Email"
          name="email"
          type="email"
          icon="mail"
          value={form.formData.email}
          onChange={form.handleChange}
          placeholder="e.g. priya@gmail.com"
          error={form.errors.email}
          ariaLabel="Email address"
        />

        {/* Password Fields - Two Column on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Password"
            name="password"
            type="password"
            icon="lock"
            value={form.formData.password}
            onChange={form.handleChange}
            placeholder="••••••••"
            error={form.errors.password}
            ariaLabel="Password"
          />
          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            icon="verified"
            value={form.formData.confirmPassword}
            onChange={form.handleChange}
            placeholder="••••••••"
            error={form.errors.confirmPassword}
            ariaLabel="Confirm password"
          />
        </div>

        {/* Terms Checkbox */}
        <FormCheckbox
          id="terms"
          name="agreed"
          checked={form.formData.agreed}
          onChange={form.handleChange}
          label={
            <>
              I agree to the <a className="text-primary font-bold hover:underline" href="#">Terms</a> and{' '}
              <a className="text-primary font-bold hover:underline" href="#">Privacy Policy</a>
            </>
          }
          error={form.errors.agreed}
          ariaLabel="Agree to terms and privacy policy"
        />

        {/* Submit Button */}
        <SubmitButton
          loading={form.loading}
          disabled={form.loading || !form.formData.fullName.trim()}
          label="Create Account"
          loadingLabel="Creating account..."
        />
      </form>

      {/* Security Notice */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-muted-green/70 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">verified</span>
          Your data is secured with encryption
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;