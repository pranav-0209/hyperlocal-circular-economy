import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import { registerSchema } from '../../schemas/authSchemas';
import { ROUTES } from '../../constants';

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

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

      setTimeout(() => navigate(ROUTES.LOGIN), 2000);
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
          Already part of the movement? <a className="text-primary font-bold hover:underline" href={ROUTES.LOGIN}>Log in here</a>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">
                      person
                    </span>
                    <Input placeholder="e.g. Priya Sharma" className="pl-10" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">
                      mail
                    </span>
                    <Input placeholder="e.g. priya@gmail.com" type="email" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">
                        verified
                      </span>
                      <Input placeholder="••••••••" type="password" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Terms Checkbox */}
          <FormField
            control={form.control}
            name="agreed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I agree to the <a className="text-primary font-bold hover:underline" href="#">Terms</a> and <a className="text-primary font-bold hover:underline" href="#">Privacy Policy</a>
                  </FormLabel>
                  <FormMessage />
                </div>
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
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </Form>

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