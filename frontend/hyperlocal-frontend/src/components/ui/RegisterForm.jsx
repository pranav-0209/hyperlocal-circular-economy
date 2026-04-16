import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { registerUser } from '../../services/authService';
import { registerSchema } from '../../schemas/authSchemas';
import { ROUTES } from '../../constants';
import PolicyModal from './PolicyModal';

// UI Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

const REDIRECT_DELAY_MS = 3000;

const RegisterForm = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [redirectProgress, setRedirectProgress] = useState(0);
  const [policyModal, setPolicyModal] = useState(null); // 'terms' | 'privacy' | null
  const [showPasswords, setShowPasswords] = useState({ password: false, confirmPassword: false });
  const passwordInputRef = React.useRef(null);
  const confirmPasswordInputRef = React.useRef(null);

  const togglePasswordVisibility = (fieldName) => {
    setShowPasswords((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
    requestAnimationFrame(() => {
      if (fieldName === 'password') {
        passwordInputRef.current?.focus();
        return;
      }
      confirmPasswordInputRef.current?.focus();
    });
  };

  React.useEffect(() => {
    if (!success) return;

    setRedirectProgress(0);

    // Kick the width change after first success render so CSS transition can animate.
    const progressTimer = window.setTimeout(() => {
      setRedirectProgress(100);
    }, 50);

    const redirectTimer = window.setTimeout(() => {
      navigate(ROUTES.LOGIN);
    }, REDIRECT_DELAY_MS);

    return () => {
      window.clearTimeout(progressTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [success, navigate]);

  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreed: false,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(data) {
    try {
      const response = await registerUser({
        name: data.fullName,
        email: data.email,
        password: data.password,
        agreeToTerms: data.agreed,
      });

      console.log('Registration successful:', response);
      setSuccess(true);
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Registration failed'
      });
    }
  }

  if (success) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-charcoal">Welcome to ShareMore!</h2>
          <p className="text-muted-green text-base max-w-sm">
            Your account has been created successfully. Redirecting to login...
          </p>
        </div>
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mt-6">
          <div
            className="h-full bg-primary"
            style={{ width: `${redirectProgress}%`, transition: `width ${REDIRECT_DELAY_MS / 1000}s linear` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 mb-3">
          <span className="material-symbols-outlined text-primary text-sm">person_add</span>
          <span className="text-[0.7rem] font-bold text-primary uppercase tracking-widest">New account</span>
        </div>
        <h1
          className="text-2xl font-bold mb-1.5 text-charcoal leading-tight"
          style={{ fontFamily: 'var(--font-family-heading)', fontWeight: 800 }}
        >
          Join ShareMore
        </h1>
        <p className="text-muted-green text-sm">
          Already a member?{' '}
          <a className="text-primary font-bold hover:underline" href={ROUTES.LOGIN}>
            Sign in here
          </a>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">

          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-charcoal">Full Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-green text-[1.1rem]">
                      person
                    </span>
                    <Input
                      placeholder="e.g. Priya Sharma"
                      className="pl-11 h-11 rounded-xl border-gray-200 bg-background-light focus:border-primary focus:ring-1 focus:ring-primary/30 text-charcoal placeholder:text-muted-green/50"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-charcoal">Email address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-green text-[1.1rem]">
                      mail
                    </span>
                    <Input
                      placeholder="e.g. priya@gmail.com"
                      type="email"
                      className="pl-11 h-11 rounded-xl border-gray-200 bg-background-light focus:border-primary focus:ring-1 focus:ring-primary/30 text-charcoal placeholder:text-muted-green/50"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-charcoal">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-green text-[1.1rem]">
                        lock
                      </span>
                      <Input
                        ref={passwordInputRef}
                        placeholder="••••••••"
                        type={showPasswords.password ? 'text' : 'password'}
                        className="pl-11 pr-10 h-11 rounded-xl border-gray-200 bg-background-light focus:border-primary focus:ring-1 focus:ring-primary/30 text-charcoal placeholder:text-muted-green/50"
                        {...field}
                      />
                      <button
                        type="button"
                        aria-label={showPasswords.password ? 'Hide password' : 'Show password'}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => togglePasswordVisibility('password')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 text-muted-green hover:text-primary transition-colors"
                      >
                        <span className="relative w-5 h-5 block">
                          <span
                            className={`absolute inset-0 flex items-center justify-center transition-all duration-150 ${
                              showPasswords.password ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                            }`}
                          >
                            <Eye className="w-5 h-5" aria-hidden="true" />
                          </span>
                          <span
                            className={`absolute inset-0 flex items-center justify-center transition-all duration-150 ${
                              showPasswords.password ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                            }`}
                          >
                            <EyeOff className="w-5 h-5" aria-hidden="true" />
                          </span>
                        </span>
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-charcoal">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-green text-[1.1rem]">
                        verified
                      </span>
                      <Input
                        ref={confirmPasswordInputRef}
                        placeholder="••••••••"
                        type={showPasswords.confirmPassword ? 'text' : 'password'}
                        className="pl-11 pr-10 h-11 rounded-xl border-gray-200 bg-background-light focus:border-primary focus:ring-1 focus:ring-primary/30 text-charcoal placeholder:text-muted-green/50"
                        {...field}
                      />
                      <button
                        type="button"
                        aria-label={showPasswords.confirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 text-muted-green hover:text-primary transition-colors"
                      >
                        <span className="relative w-5 h-5 block">
                          <span
                            className={`absolute inset-0 flex items-center justify-center transition-all duration-150 ${
                              showPasswords.confirmPassword ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                            }`}
                          >
                            <Eye className="w-5 h-5" aria-hidden="true" />
                          </span>
                          <span
                            className={`absolute inset-0 flex items-center justify-center transition-all duration-150 ${
                              showPasswords.confirmPassword ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                            }`}
                          >
                            <EyeOff className="w-5 h-5" aria-hidden="true" />
                          </span>
                        </span>
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Terms Checkbox — custom styled */}
          <FormField
            control={form.control}
            name="agreed"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-3">
                  <FormControl>
                    {/* Custom checkbox */}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={field.value}
                      onClick={() => field.onChange(!field.value)}
                      className="ml-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1"
                      style={{
                        backgroundColor: field.value ? 'var(--color-primary)' : 'transparent',
                        borderColor: field.value ? 'var(--color-primary)' : '#d1d5db',
                      }}
                    >
                      {field.value && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </FormControl>
                  <div>
                    <FormLabel className="font-normal text-sm text-muted-green leading-snug cursor-pointer" onClick={() => field.onChange(!field.value)}>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPolicyModal('combined'); }}
                        className="text-primary font-semibold hover:underline"
                      >
                        Terms &amp; Privacy Policy
                      </button>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </div>
              </FormItem>
            )}
          />

          {/* Global Error */}
          {form.formState.errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-lg mt-0.5">error</span>
              <span>{form.formState.errors.root.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full h-12 rounded-xl font-bold text-[0.95rem] text-white transition-all shadow-md shadow-primary/20 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #1a5948 100%)' }}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </>
            )}
          </button>
        </form>
      </Form>

      {policyModal && <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} />}

      {/* Security Notice */}
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <p className="text-xs text-muted-green/60 flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-sm">verified</span>
          Your data is secured with encryption
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;