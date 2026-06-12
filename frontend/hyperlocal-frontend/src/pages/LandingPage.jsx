import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Menu,
  X,
  Moon,
  Sun,
  ShieldCheck,
  Users,
  MapPin,
  Key,
  Lock,
  PackageSearch,
  Handshake,
  TrendingUp,
  GraduationCap,
  Building2,
  Briefcase,
  Heart,
  Home,
  LayoutGrid,
  ChevronRight,
  Leaf,
  ArrowUpRight,
  CircleCheck,
} from 'lucide-react';
import { ROUTES } from '../constants';
import { useDarkMode } from '../hooks/useDarkMode';
import '../index.css';

/* ─────────────────────────────────────────────────────────────
   TYPOGRAPHY HELPERS
   Gilroy ExtraBold (800) for display headings
   Manrope (fallback) for body wherever Gilroy 300 would be thin
───────────────────────────────────────────────────────────── */
const HEADING = {
  fontFamily: 'var(--font-family-heading)',
  fontWeight: 800,
};
const SUBHEADING = {
  fontFamily: 'var(--font-family-heading)',
  fontWeight: 800,
};

/* ─────────────────────────────────────────────────────────────
   SHARED MOTION VARIANTS
───────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerGrid = (gap = 0.1, delay = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap, delayChildren: delay } },
});

/* ─────────────────────────────────────────────────────────────
   SCROLL-REVEAL WRAPPER
───────────────────────────────────────────────────────────── */
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-64px' });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BRAND LOGO
───────────────────────────────────────────────────────────── */
function Logo({ className = 'size-5' }) {
  return (
    <svg className={`${className} text-white`} fill="none" viewBox="0 0 48 48">
      <path
        d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();

  /* Dark mode — shared hook (persists to localStorage) */
  const { dark, toggle: toggleDark } = useDarkMode();

  /* Navbar scroll shadow */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* Mobile menu */
  const [menuOpen, setMenuOpen] = useState(false);

  /* Step hover tracking — avoids CSS group-hover quirks in Tailwind v4 */
  const [hoveredStep, setHoveredStep] = useState(null);

  /* ── Data ──────────────────────────────────────────────── */
  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Communities', href: '#communities' },
  ];

  const steps = [
    {
      Icon: Users,
      title: 'Create an Account',
      desc: 'Register with your email address. It takes less than a minute to get started.',
    },
    {
      Icon: ShieldCheck,
      title: 'Verify Your Identity',
      desc: 'Complete your profile and upload a government ID. Our team reviews it before granting access.',
    },
    {
      Icon: Key,
      title: 'Join or Start a Community',
      desc: 'Enter an invite code to join an existing circle, or create one and invite your neighbours.',
    },
    {
      Icon: PackageSearch,
      title: 'Browse & Request',
      desc: 'Find items listed by verified members in your community and send a borrow request.',
    },
    {
      Icon: Handshake,
      title: 'Collect & Return',
      desc: 'Meet your neighbour, use the item responsibly, and return it on time. Builds your trust score.',
    },
  ];

  const features = [
    {
      Icon: ShieldCheck,
      title: 'Identity Verification',
      desc: 'Every member completes a 3-step process — profile, government ID, and human review — before joining any community. No shortcuts.',
      tag: 'Safety First',
      accent: false,
    },
    {
      Icon: Key,
      title: 'Invite-code Communities',
      desc: 'Communities are private by default. Admins share a unique code and control whether new members need manual approval or open access.',
      tag: 'Private Circles',
      accent: false,
    },
    {
      Icon: PackageSearch,
      title: 'Community-scoped Marketplace',
      desc: 'You only see items from communities you have joined. No noise from strangers — just listings from people you are already connected with.',
      tag: 'Hyperlocal',
      accent: true,
    },
    {
      Icon: TrendingUp,
      title: 'Trust Score',
      desc: 'Every completed exchange builds your trust score. A visible reputation means members know who they are dealing with before agreeing to anything.',
      tag: 'Accountability',
      accent: false,
    },
  ];

  const communityTypes = [
    {
      Icon: Home,
      label: 'Neighbourhood',
      desc: 'Share with people on your street or in your apartment complex.',
    },
    {
      Icon: GraduationCap,
      label: 'College',
      desc: 'Borrow textbooks, gear, and equipment within your campus circle.',
    },
    {
      Icon: Briefcase,
      label: 'Office',
      desc: 'Lend and exchange within a shared workplace community.',
    },
    {
      Icon: Building2,
      label: 'Society',
      desc: 'Organised sharing for gated societies and residential blocks.',
    },
    {
      Icon: Heart,
      label: 'Interest Group',
      desc: 'Pool resources with people who share your hobby or passion.',
    },
    {
      Icon: LayoutGrid,
      label: 'Other',
      desc: 'Create a custom circle for any group of trusted people.',
    },
  ];

  const categories = [
    { emoji: '🔧', label: 'Tools' },
    { emoji: '📱', label: 'Electronics' },
    { emoji: '📚', label: 'Books' },
    { emoji: '🪑', label: 'Furniture' },
    { emoji: '🍳', label: 'Appliances' },
    { emoji: '👕', label: 'Fashion' },
    { emoji: '⚽', label: 'Sports' },
    { emoji: '🧒', label: 'Kids' },
  ];
  const marqueeCategories = [...categories, ...categories];

  /* ────────────────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────────────────── */
  return (
    <div className="bg-background-light text-charcoal min-h-screen">

      {/* ══════════════════════════════════════════════════════
          NAVBAR — position:fixed, glassmorphism, scroll shadow
          ══════════════════════════════════════════════════════ */}
      <header
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}
        className={`glass-nav transition-all duration-300 ${scrolled ? 'shadow-[0_1px_20px_rgba(0,0,0,0.09)] border-b border-gray-200/70' : 'border-b border-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-[70px]">

          {/* Brand */}
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 group"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            id="nav-brand"
          >
            <div className="bg-primary p-1.5 rounded-xl shadow-sm shadow-primary/20 group-hover:brightness-110 transition-all">
              <Logo className="size-5" />
            </div>
            <span className="text-[1.3rem] text-charcoal" style={HEADING}>
              ShareMore
            </span>
          </motion.button>

          {/* Desktop links */}
          <motion.nav
            className="hidden md:flex items-center gap-8"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[1rem] font-semibold text-muted-green hover:text-primary transition-colors relative group"
              >
                {l.label}
                <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-primary rounded-full group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </motion.nav>

          {/* Actions */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {/* Dark mode */}
            <button
              id="dark-toggle"
              onClick={toggleDark}
              className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center text-muted-green hover:text-primary hover:bg-primary/8 transition-all"
              aria-label="Toggle dark mode"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={dark ? 'sun' : 'moon'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.span>
              </AnimatePresence>
            </button>

            <button
              id="nav-login"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="hidden sm:block px-5 py-2 text-[0.9rem] font-bold rounded-xl border transition-all"
              style={{
                color: dark ? 'rgba(255,255,255,0.85)' : 'var(--color-charcoal)',
                borderColor: dark ? 'rgba(255,255,255,0.18)' : '#e5e7eb',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'rgba(5,128,116,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.85)' : 'var(--color-charcoal)'; e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.18)' : '#e5e7eb'; }}
            >
              Log In
            </button>

            <button
              id="nav-join"
              onClick={() => navigate(ROUTES.REGISTER)}
              className="brand-btn-primary px-5 py-2 text-[0.9rem] rounded-xl"
            >
              Get Started
            </button>

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-btn"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-charcoal hover:bg-gray-100 transition-all"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={menuOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.16 }}
                >
                  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </motion.div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="drawer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="md:hidden overflow-hidden border-t border-gray-100"
            >
              <div className="px-6 py-3 space-y-1">
                {navLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-xl text-[0.9rem] font-semibold text-charcoal hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    {l.label}
                  </a>
                ))}
                <div className="pt-3 pb-1 flex gap-2 border-t border-gray-100 mt-1">
                  <button
                    onClick={() => { navigate(ROUTES.LOGIN); setMenuOpen(false); }}
                    className="flex-1 py-2.5 text-sm font-bold rounded-xl border border-gray-200 text-charcoal"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { navigate(ROUTES.REGISTER); setMenuOpen(false); }}
                    className="brand-btn-primary flex-1 py-2.5 text-sm rounded-xl"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* ════════════════════════════════════════════════════
            HERO
            ════════════════════════════════════════════════════ */}
        <section className={`relative hero-section min-h-[88vh] flex items-center justify-center px-6 lg:px-10 pt-36 pb-24 overflow-hidden ${dark ? 'bg-primary/6' : 'bg-card-surface'}`}>

          {/* Grid overlay */}
          <div className="hero-grid-overlay" />

          {/* Radial glow */}
          <div className="hero-radial-glow" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">

            {/* Pill label */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-9 backdrop-blur-sm"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="text-[0.78rem] font-semibold text-muted-green tracking-wide">
                Hyperlocal · Verified Members Only
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-charcoal leading-[1.07] tracking-tight"
              style={{
                ...HEADING,
                fontSize: 'clamp(2.8rem, 6.5vw, 5rem)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Borrow, Share &amp; Trade
              <br />
              <span className="gradient-text">within your community.</span>
            </motion.h1>

            {/* Sub-text */}
            <motion.p
              className="mt-7 text-muted-green leading-relaxed max-w-2xl mx-auto"
              style={{ fontSize: 'clamp(1.05rem, 2vw, 1.2rem)', lineHeight: 1.75 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
            >
              ShareMore lets verified neighbours share tools, books, electronics, and more — inside
              private, invite-only local circles. No strangers. No clutter. Just people you know.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42 }}
            >
              <motion.button
                id="hero-cta-primary"
                onClick={() => navigate(ROUTES.REGISTER)}
                className="brand-btn-primary group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-[0.95rem]"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Create an Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
              </motion.button>
              <motion.button
                id="hero-cta-secondary"
                onClick={() => navigate(ROUTES.LOGIN)}
                className="hero-secondary-btn w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-2xl border text-[0.95rem]"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                I already have an account
                <ChevronRight className="w-4 h-4 opacity-60" />
              </motion.button>
            </motion.div>

            {/* Fine print */}
            <motion.p
              className="mt-8 text-muted-green/70 text-[0.8rem]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Identity verification required · Private communities · Free to join
            </motion.p>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background-light to-transparent pointer-events-none" />
        </section>

        {/* ════════════════════════════════════════════════════
            CATEGORY STRIP — real item types from DiscoverPage
            ════════════════════════════════════════════════════ */}
        <section className={`w-full border-b border-gray-100 py-12 ${dark ? 'bg-primary/6' : 'bg-card-surface'}`}>
          <Reveal>
            <div className="w-full space-y-3">
              <span className="block text-center text-[0.95rem] font-semibold text-muted-green mb-5 px-6 lg:px-10">
                What gets shared:
              </span>

              <div className="relative w-full overflow-hidden">
                <div className="w-full px-6 sm:px-8 lg:px-10">
                  <div className="category-marquee-track min-w-max">
                    {[0, 1].map((cloneIndex) => (
                      <div
                        key={cloneIndex}
                        className="flex items-center gap-4 pr-4 shrink-0 min-w-max"
                        aria-hidden={cloneIndex === 1}
                      >
                        {marqueeCategories.map((c, itemIndex) => (
                          <span
                            key={`${cloneIndex}-${itemIndex}-${c.label}`}
                            className="category-chip flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/6 border border-primary/12 text-[0.95rem] sm:text-base font-semibold text-primary flex-shrink-0"
                          >
                            <span className="text-lg">{c.emoji}</span>
                            {c.label}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ════════════════════════════════════════════════════
            HOW IT WORKS
            ════════════════════════════════════════════════════ */}
        <section id="how-it-works" className={`w-full py-12 lg:py-16 px-6 lg:px-10 ${dark ? '' : 'bg-background-light'}`}>
          <div className="max-w-7xl mx-auto">

            {/* Section header */}
            <Reveal className="text-center mb-16 space-y-4">
              <span className="inline-block text-[0.75rem] font-bold text-primary uppercase tracking-widest px-3 py-1 rounded-full bg-primary/8">
                How It Works
              </span>
              <h2
                className="text-charcoal"
                style={{
                  ...HEADING,
                  fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                }}
              >
                From signup to your first borrow
              </h2>
              <p
                className="text-muted-green max-w-xl mx-auto"
                style={{ fontSize: '1.05rem', lineHeight: 1.7 }}
              >
                Five straightforward steps. Every action is built around verified connections and responsible sharing.
              </p>
            </Reveal>

            {/* Steps grid */}
            <div className="relative">
              {/* Connector — desktop only */}
              <div
                className="hidden lg:block absolute top-9 left-[8%] right-[8%] h-px pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, var(--color-primary) 20%, rgba(49,129,109,0.2) 80%, transparent)',
                  zIndex: 0,
                }}
              />

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 relative z-10"
                variants={staggerGrid(0.09, 0.08)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                {steps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    variants={fadeUp}
                    className="flex flex-col items-center text-center"
                    onMouseEnter={() => setHoveredStep(i)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    {/* Icon box — Framer Motion handles hover, no CSS group-hover */}
                    <motion.div
                      className="relative w-[76px] h-[76px] rounded-2xl flex items-center justify-center mb-5 cursor-default"
                      animate={{
                        backgroundColor: hoveredStep === i ? 'var(--color-primary)' : dark ? '#f8f7f4' : '#ffffff',
                        boxShadow: hoveredStep === i
                          ? '0 8px 24px rgba(49,129,109,0.28)'
                          : '0 2px 8px rgba(0,0,0,0.06)',
                        scale: hoveredStep === i ? 1.08 : 1,
                      }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      style={{ border: '1px solid', borderColor: hoveredStep === i ? 'var(--color-primary)' : dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6' }}
                    >
                      <motion.div
                        animate={{ color: hoveredStep === i ? '#ffffff' : 'var(--color-primary)' }}
                        transition={{ duration: 0.2 }}
                      >
                        <step.Icon className="w-7 h-7" />
                      </motion.div>

                      {/* Step number badge */}
                      <motion.span
                        className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full text-white text-[10px] flex items-center justify-center shadow-sm"
                        animate={{ backgroundColor: hoveredStep === i ? '#1a5948' : 'var(--color-primary)' }}
                        transition={{ duration: 0.2 }}
                        style={{ fontWeight: 800 }}
                      >
                        {i + 1}
                      </motion.span>
                    </motion.div>

                    <p
                      className="text-charcoal mb-2"
                      style={{ ...SUBHEADING, fontSize: '0.95rem' }}
                    >
                      {step.title}
                    </p>
                    <p className="text-muted-green leading-relaxed" style={{ fontSize: '0.875rem', lineHeight: 1.65 }}>
                      {step.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* CTA below steps */}
            <Reveal className="mt-14 text-center" delay={0.06}>
              <motion.button
                id="hiw-cta"
                onClick={() => navigate(ROUTES.REGISTER)}
                className="brand-btn-primary group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[0.9rem]"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Start the process
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
              </motion.button>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            FEATURES
            ════════════════════════════════════════════════════ */}
        <section
          id="features"
          className={`w-full py-14 lg:py-20 px-6 lg:px-10 ${dark ? 'bg-primary/6' : 'bg-card-surface'}`}
        >
          <div className="max-w-7xl mx-auto">

            <Reveal className="mb-14 space-y-3">
              <span className="text-[0.80rem] font-bold text-primary uppercase tracking-widest">
                Platform Features
              </span>
              <h2
                className="text-charcoal max-w-xl"
                style={{ ...HEADING, fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
              >
                Built around{' '}
                <span className="gradient-text">trust and access control.</span>
              </h2>
              <p className="text-muted-green max-w-lg" style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                Every feature exists to help verified people share responsibly inside closed, managed circles.
              </p>
            </Reveal>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
              variants={staggerGrid(0.08, 0.06)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  className={`rounded-2xl p-8 border flex flex-col gap-5 hover-lift relative overflow-hidden ${feature.accent
                    ? 'brand-gradient-card text-white border-transparent shadow-xl shadow-primary/25'
                    : `${dark ? 'bg-card-surface' : 'bg-background-light'} text-charcoal border-gray-100`
                    }`}
                  whileHover={feature.accent ? { scale: 1.01 } : { borderColor: 'rgba(49,129,109,0.22)' }}
                >
                  {/* Tag */}
                  <span
                    className={`self-start text-[0.7rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${feature.accent
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'bg-primary/8 text-primary border border-primary/15'
                      }`}
                  >
                    {feature.tag}
                  </span>

                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${feature.accent ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary'
                        }`}
                    >
                      <feature.Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3
                        className={`mb-2 ${feature.accent ? 'text-white' : 'text-charcoal'}`}
                        style={{ ...SUBHEADING, fontSize: '1.05rem' }}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={`leading-relaxed ${feature.accent ? 'text-white/80' : 'text-muted-green'}`}
                        style={{ fontSize: '0.95rem', lineHeight: 1.7 }}
                      >
                        {feature.desc}
                      </p>
                    </div>
                  </div>

                  {feature.accent && (
                    <div
                      className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none opacity-20"
                      style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 70%)' }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Verification step callout */}
            <Reveal className="mt-6" delay={0.08}>
              <div className={`${dark ? 'bg-card-surface' : 'bg-background-light'} border border-gray-100 rounded-2xl px-7 py-5 flex flex-col sm:flex-row sm:items-center gap-5`}>
                <div className="flex items-center gap-3.5 flex-shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-green-700" />
                  </div>
                  <span className="text-[1rem] font-semibold text-charcoal leading-snug">
                    Your information is securely encrypted and never shared without permission.
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 sm:ml-auto">
                  {['Profile + photo', 'Government ID', 'Manual review'].map((s, i) => (
                    <span key={s} className="flex items-center gap-1.5 text-[0.82rem] font-semibold text-muted-green">
                      <CircleCheck className="w-3.5 h-3.5 text-primary" />
                      {s}
                      {i < 2 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            COMMUNITY TYPES
            ════════════════════════════════════════════════════ */}
        <section id="communities" className={`w-full py-12 lg:py-20 px-6 lg:px-10 ${dark ? '' : 'bg-background-light'}`}>
          <div className="max-w-7xl mx-auto">

            <Reveal className="text-center mb-14 space-y-4">
              <span className="inline-block text-[0.75rem] font-bold text-primary uppercase tracking-widest px-3 py-1 rounded-full bg-primary/8">
                Community Types
              </span>
              <h2
                className="text-charcoal"
                style={{ ...HEADING, fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
              >
                A circle for every group.
              </h2>
              <p
                className="max-w-lg mx-auto text-muted-green"
                style={{ fontSize: '1.05rem', lineHeight: 1.7 }}
              >
                Whether you live in an apartment, study on a campus, or work in an office — there's a
                community type built for your group. Admins decide who can join and how.
              </p>
            </Reveal>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              variants={staggerGrid(0.07, 0.06)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              {communityTypes.map((communityType) => (
                <motion.div
                  key={communityType.label}
                  variants={fadeUp}
                  className="bg-card-surface rounded-2xl border border-gray-100 p-6 hover-lift group cursor-default"
                  whileHover={{ borderColor: 'rgba(49,129,109,0.22)' }}
                >
                  <div className="flex items-center gap-3.5 mb-3.5">
                    <motion.div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.08 }}
                      animate={{}}
                      style={{ backgroundColor: 'rgba(49,129,109,0.08)', color: 'var(--color-primary)' }}
                    >
                      <communityType.Icon className="w-5 h-5" />
                    </motion.div>
                    <h3
                      className="text-charcoal"
                      style={{ ...SUBHEADING, fontSize: '0.95rem' }}
                    >
                      {communityType.label}
                    </h3>
                  </div>
                  <p className="text-muted-green leading-relaxed" style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>
                    {communityType.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Invite-code callout */}
            <Reveal className="mt-10" delay={0.1}>
              <div
                className="invite-code-card rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl shadow-primary/10"
              >
                <div
                  className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-15"
                  style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 70%)', transform: 'translate(30%, -30%)' }}
                />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-7">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-white" />
                      <span className="text-[0.72rem] font-bold text-white uppercase tracking-widest">
                        Invite Code System
                      </span>
                    </div>
                    <h3
                      className="text-white"
                      style={{ ...HEADING, fontSize: 'clamp(1.3rem, 3vw, 1.7rem)' }}
                    >
                      Private by design — only people you invite can join.
                    </h3>
                    <p className="text-white/70 leading-relaxed font-medium" style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>
                      Create a community and get an auto-generated invite code. Share it with your neighbours or
                      colleagues. You control who gets in and whether requests need approval.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <motion.button
                      id="community-cta"
                      onClick={() => navigate(ROUTES.REGISTER)}
                      className="btn-white-on-primary inline-flex items-center gap-2 px-7 py-3.5 font-bold rounded-xl text-[0.9rem]"
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Create a Community
                      <ArrowUpRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
    FINAL CTA - REDESIGNED CULMINATION
    ════════════════════════════════════════════════════ */}
        <section className={`final-cta-section w-full py-24 px-6 lg:px-1 overflow-hidden ${dark ? 'bg-primary/6' : 'bg-card-surface'}`}>
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                {/* Left Column: Outcomes & Value Props */}
                <div className="lg:col-span-7 space-y-8 text-left">
                  <div className="space-y-4">
                    <span className="inline-block text-[0.75rem] font-bold text-primary uppercase tracking-widest px-3 py-1 rounded-full bg-primary/8">
                      Join ShareMore
                    </span>

                    <h2
                      className="text-charcoal leading-[1.15] tracking-tight"
                      style={{
                        ...HEADING,
                        fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                      }}
                    >
                      Borrow, share, and build a <br />
                      <span className="gradient-text">
                        sustainable community.
                      </span>
                    </h2>

                    <p className="text-muted-green max-w-xl text-[1.05rem] leading-relaxed">
                      Why buy when you can borrow? Connect with verified neighbors
                      to share tools, equipment, and electronics safely. Together,
                      we reduce waste, save money, and foster real local collaboration.
                    </p>
                  </div>

                  {/* Outcome Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {[
                      {
                        title: 'Zero Waste Sharing',
                        desc: 'Keep functional items in circulation and reduce local waste.',
                      },
                      {
                        title: '100% Verified Members',
                        desc: 'Every neighbor undergoes identity review for absolute peace of mind.',
                      },
                      {
                        title: 'Invite-Only Privacy',
                        desc: 'Your listings and community circles stay strictly confidential.',
                      },
                      {
                        title: 'Zero Rental Fees',
                        desc: 'Completely free neighbor-to-neighbor exchanges based on trust.',
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-1">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>

                        <div>
                          <h4 className="font-bold text-[0.95rem] text-charcoal">
                            {item.title}
                          </h4>
                          <p className="text-[0.85rem] text-muted-green leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: CTA Card */}
                <div className="lg:col-span-5">
                  <div className="relative overflow-hidden rounded-3xl  border border-gray-100 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">

                    {/* Internal Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-6 text-center lg:text-left">
                      <div className="space-y-2">
                        <h3
                          className="text-[1.3rem] text-charcoal"
                          style={HEADING}
                        >
                          Get Started Today
                        </h3>

                        <p className="text-muted-green text-sm">
                          Create an account or start a neighborhood circle in under
                          two minutes.
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <motion.button
                          id="final-cta-register"
                          onClick={() => navigate(ROUTES.REGISTER)}
                          className="brand-btn-primary group w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-[0.95rem]"
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Create an Account
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                        </motion.button>

                        <motion.button
                          id="final-cta-login"
                          onClick={() => navigate(ROUTES.LOGIN)}
                          className="hero-secondary-btn w-full flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-2xl border text-[0.95rem]"
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Log In to Your Circle
                        </motion.button>
                      </div>

                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-[0.78rem] text-muted-green/60 text-center lg:text-left">
                          Identity verification required · Free to join · Secure data encryption
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════ */}
      <footer className="w-full pt-16 pb-9 px-6 lg:px-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

            {/* Brand column */}
            <div className="space-y-5 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-1.5 rounded-xl">
                  <Logo className="size-5" />
                </div>
                <span className="text-[1rem] text-charcoal" style={HEADING}>
                  ShareMore
                </span>
              </div>
              <p className="text-muted-green leading-relaxed max-w-xs" style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>
                Verified, community-based item sharing for neighbours, students, and colleagues.
              </p>
            </div>

            {/* Link columns */}
            {[
              {
                title: 'Platform',
                links: [
                  { label: 'How It Works', href: '#how-it-works' },
                  { label: 'Features', href: '#features' },
                  { label: 'Community Types', href: '#communities' },
                  { label: 'Marketplace', href: ROUTES.DISCOVER ?? '#' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'About', href: '#' },
                  { label: 'Privacy Policy', href: '#' },
                  { label: 'Terms of Service', href: '#' },
                ],
              },
              {
                title: 'Support',
                links: [
                  { label: 'Help Center', href: '#' },
                  { label: 'Contact Us', href: '#' },
                ],
              },
            ].map((col) => (
              <div key={col.title} className="space-y-4">
                <h4 className="text-charcoal uppercase tracking-wider" style={{ ...HEADING, fontSize: '0.72rem' }}>
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="text-muted-green hover:text-primary transition-colors"
                        style={{ fontSize: '0.875rem' }}
                        onClick={href.startsWith('#') ? (e) => {
                          e.preventDefault();
                          const id = href.slice(1);
                          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                        } : undefined}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-7 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ fontSize: '0.8rem', color: 'var(--color-muted-green)' }}>
            <p>© 2026 ShareMore. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-primary" />
              Reduce waste. Share more.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
