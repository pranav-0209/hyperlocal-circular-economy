import React, { useState } from 'react';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', phone: '', communityCode: ''
  });
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Register:', formData, agreed);
  };

  return (
    <div className="w-full max-w-[420px] h-screen overflow-y-auto scrollbar-hide">
      <div className="mb-4 text-center lg:text-left">
        <h1 className="font-heading text-xl lg:text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-muted-green text-sm">
          Already part of the movement? <a className="text-accent font-bold hover:underline" href="/login">Log in here</a>
        </p>
      </div>

      {/* Social Logins */}
      <div className="flex gap-2 mb-4">
        <button className="flex-1 flex items-center justify-center gap-1 h-11 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium text-xs">
          <svg className="size-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z" fill="#EA4335"/>
          </svg>
          <span className="hidden sm:inline">Google</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 h-11 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium text-xs">
          <svg className="size-4 dark:fill-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.96.95-2.12 2.22-3.66 2.22-1.47 0-2.05-.91-3.83-.91-1.79 0-2.43.89-3.83.91-1.5 0-2.88-1.5-3.85-2.58-2.17-2.38-3.34-6.42-3.34-8.87 0-3.68 2.22-5.74 4.54-5.74 1.25 0 2.2.73 3.1 0.73 0.89 0 1.95-.74 3.3-.74 1.15 0 2.68.52 3.65 1.76-2.91 1.63-2.43 6.07 0.38 7.21-0.63 1.58-1.42 3.12-2.36 4.22zM12.01 4.6c-.1-2.47 1.96-4.59 4.28-4.6.25 2.68-2.12 4.88-4.28 4.6z"/>
          </svg>
          <span className="hidden sm:inline">Apple</span>
        </button>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-100 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
          <span className="bg-background-light dark:bg-background-dark px-2 text-muted-green/60">Or register</span>
        </div>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="group">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-green mb-1 ml-1">Full Name</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-green/50 text-lg group-focus-within:text-primary transition-colors">person</span>
            <input 
              className="w-full pl-10 pr-3 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-charcoal dark:text-white placeholder:text-muted-green/40 text-sm" 
              placeholder="John Doe" 
              type="text" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
            />
          </div>
        </div>

        {/* Email */}
        <div className="group">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-green mb-1 ml-1">Email</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-green/50 text-lg group-focus-within:text-primary transition-colors">mail</span>
            <input 
              className="w-full pl-10 pr-3 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-charcoal dark:text-white placeholder:text-muted-green/40 text-sm" 
              placeholder="john@example.com" 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
            />
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-green mb-1 ml-1">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-green/50 text-lg group-focus-within:text-primary transition-colors">lock</span>
              <input 
                className="w-full pl-10 pr-3 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-charcoal dark:text-white placeholder:text-muted-green/40 text-sm" 
                placeholder="••••••••" 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
              />
            </div>
          </div>
          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-green mb-1 ml-1">Confirm</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-green/50 text-lg group-focus-within:text-primary transition-colors">verified</span>
              <input 
                className="w-full pl-10 pr-3 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-charcoal dark:text-white placeholder:text-muted-green/40 text-sm" 
                placeholder="••••••••" 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
              />
            </div>
          </div>
        </div>

        {/* Phone & Community Code */}
        <div className="grid grid-cols-2 gap-3">
          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-green mb-1 ml-1">Phone</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-green/50 text-lg group-focus-within:text-primary transition-colors">call</span>
              <input 
                className="w-full pl-10 pr-3 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-charcoal dark:text-white placeholder:text-muted-green/40 text-sm" 
                placeholder="+1 (555) 000-0000" 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
              />
            </div>
          </div>
          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-green mb-1 ml-1">Area Code</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-green/50 text-lg group-focus-within:text-primary transition-colors">map</span>
              <input 
                className="w-full pl-10 pr-3 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-charcoal dark:text-white placeholder:text-muted-green/40 text-sm" 
                placeholder="e.g. 10001" 
                type="text" 
                name="communityCode" 
                value={formData.communityCode} 
                onChange={handleChange} 
              />
            </div>
          </div>
        </div>

        {/* Terms */}
        {/* <div className="flex items-start gap-2 py-2">
          <input 
            className="mt-0.5 size-4 rounded border-gray-300 text-primary focus:ring-primary" 
            id="terms" 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)} 
          />
          <label className="text-xs text-muted-green leading-tight" htmlFor="terms">
            I agree to the <a className="text-primary font-bold hover:underline" href="#">Terms</a> and <a className="text-primary font-bold hover:underline" href="#">Privacy Policy</a>.
          </label>
        </div> */}

        {/* Register Button */}
        <button 
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold h-11 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 text-sm mt-3" 
          type="submit" 
          disabled={!agreed}
        >
          <span>Register Now</span>
          <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </form>

    
    </div>
  );
};

export default RegisterForm;