import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import "../index.css";
import { ROUTES } from '../constants';

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-background-light text-charcoal min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-background-light/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <svg
                className="size-6 text-white"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-charcoal">ShareMore</h2>
          </div>

          <nav className="hidden md:flex items-center gap-10">
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-charcoal hover:text-primary transition-colors"
            >
              How it Works
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-charcoal hover:text-primary transition-colors"
            >
              Browse
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-charcoal hover:text-primary transition-colors"
            >
              About Us
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Join Now */}
            <button
              onClick={() => navigate(ROUTES.REGISTER)}
              className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all"
            >
              Join Now
            </button>

            {/* Login */}
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="hidden sm:block px-6 py-2.5 bg-gray-100 text-charcoal text-sm font-bold rounded-lg hover:bg-gray-200 transition-all"
            >
              Login
            </button>
          </div>

        </div>
      </header>

      {/* Rest of your component remains exactly the same */}
      <main className="flex flex-col items-center bg-background-light">
        {/* Hero */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20 mx-auto">
          <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl flex items-center justify-center p-8 lg:p-16" style={{ minHeight: '500px' }}>
            <style>{`
              @media (min-width: 1024px) {
                .hero-section {
                  min-height: 600px;
                }
              }
            `}</style>
            <div
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCd6fQxTIzudcl5V8Sq2_Zkq-bLpTOLZ3gkngPxbKbGcZ6wS9fQ2_jENbf9aBtO1rTeKxEJFgvY9YIdtgI5kkSrlx2ssbz42qQzgQImFjKbZ0AF0kbKmJ3IfrY7xe76JBMDzFJ2mgPBuUOKe6jz0Qe0JwQtjzI9vM9AzgxGznf-msoC9weYNUbilyDBs_R84lv9PFPPgPxyAZ9J8QIPQFoD1bjp4xhv2l41WgwBoY7koybDPWZkNRX69Kq-Pe-FlWL5YKkv2m2fL_s")',
              }}
            />
            <div className="relative z-10 max-w-3xl text-center space-y-8">
              <h1 className="text-white text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                Share More, Own Less. <br className="hidden lg:block" />
                <span className="text-primary/95">Build Your Community.</span>
              </h1>
              <p className="text-white/90 text-lg lg:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                Join the movement for local sustainability. Rent or share items
                with neighbors you trust. Reduce waste, save money, and meet
                your neighbors.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                  Get Started Today
                </button>
                <button className="w-full sm:w-auto px-8 py-4 bg-white text-charcoal text-base font-bold rounded-xl hover:bg-gray-100 transition-colors">
                  Browse Marketplace
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 py-12 lg:py-16 border-b border-gray-200">
          {[
            { label: "Active Members", value: "15k+" },
            { label: "CO2 Prevented", value: "40t" },
            { label: "Community Savings", value: "$2M+" },
            { label: "Trust Rating", value: "98%" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-primary text-2xl sm:text-3xl font-black">{item.value}</p>
              <p className="text-xs sm:text-sm font-medium text-muted-green mt-2">
                {item.label}
              </p>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto py-16 lg:py-24"
        >
          <div className="flex flex-col items-center text-charcoal text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Simple, Secure, Sustainable.
            </h2>
            <p className="max-w-2xl text-base sm:text-lg text-muted-green">
              Five easy steps to start sharing within your neighborhood.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-8">
            {[
              {
                icon: "person_add",
                title: "Register",
                text: "Join the movement in minutes.",
              },
              {
                icon: "verified_user",
                title: "Verify",
                text: "ID check for community safety.",
              },
              {
                icon: "search",
                title: "List/Find",
                text: "Post or search local items.",
              },
              {
                icon: "handshake",
                title: "Exchange",
                text: "Meet a neighbor nearby.",
              },
              {
                icon: "grade",
                title: "Review",
                text: "Build your local trust score.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">
                    {step.icon}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-charcoal">{step.title}</h3>
                  <p className="text-sm text-muted-green">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="w-full bg-primary/5 py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 sm:mb-16">
              <span className="text-primary font-bold text-xs tracking-widest uppercase">
                Smart Platform
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl text-charcoal font-bold mt-3">
                Engineered for Trust
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trust score */}
              <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl lg:rounded-3xl flex flex-col justify-between border border-transparent hover:border-primary/20 transition-all shadow-sm">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center">
                    <span className="material-symbols-outlined">
                      shield_with_heart
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl text-charcoal font-bold">
                    Comprehensive Trust Score
                  </h3>
                  <p className="text-muted-green max-w-md leading-relaxed">
                    Our proprietary algorithm calculates reliability based on
                    transaction history, verified ID, and peer reviews,
                    ensuring you only deal with responsible neighbors.
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                      <img
                        alt=""
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWJyHBBFe2jfCrYyYzEc-mlxKireUBDFFykiUzzZ0IOpqT00MnZa2XhYGWMxpoWqM_clWF1j2j-33fnX-odl9FNXbiU9K2-PXM4Py_Dm6u-GvM40e_CKR8OOuZoBEb_5n-7lwWpussWksD64zLfTWV8RmbbmWOM4nKPyCNSipe0nuk_YWMNWAGBGcwe30HJ9rhdyXiiAekW4_d3tliPG1ibd8vSzWfLfNIB-uUlyTz4Yhk7zvNBzbQ0PhdUyUpl7QjZ3N7A6tvH18"
                      />
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                      <img
                        alt=""
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBInFKonbXrUp3jn7cgzASvF8kSxuIGIyhZHrSq0-3FjL-psI4cpTFVpo0yiSnhhSv-1s6FED4toJh0BRAcetvICr_LO6pv-IdTBF0BDC-WYcYpPDx1m28wj9T5QLF5hZzqeCcywfbI3A8bc5JrZBxFZx05gzVlcbltTZcNR5OycpF5j38_9rGPvCi2d-uJK0LgGc1rQyvUU1RF3_cg7-n-AQhf9PJb2_GjVSXZxRRFl4kkz_u6YeWh5U2diVCPGexbdRyJCUxsz6Q"
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-muted-green">
                    Trusted by 15,000+ users
                  </span>
                </div>
              </div>

              {/* AI pricing */}
              <div className="bg-primary p-6 sm:p-8 rounded-2xl lg:rounded-3xl text-white flex flex-col justify-between shadow-lg shadow-primary/20">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold">AI Dynamic Pricing</h3>
                  <p className="text-white/80 leading-relaxed">
                    Never guess what to charge. Our AI suggests fair rental
                    prices based on item value, demand, and local market
                    trends.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm font-bold bg-white/10 p-3 rounded-lg">
                  <span className="material-symbols-outlined text-sm">
                    trending_up
                  </span>
                  <span>Average 25% higher rental success</span>
                </div>
              </div>

              {/* Smart categorization */}
              <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-2xl lg:rounded-3xl border border-transparent hover:border-primary/20 transition-all shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">category</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl text-charcoal font-bold">AI Smart Categorization</h3>
                  <p className="text-muted-green leading-relaxed">
                    Upload a photo and let our AI do the rest. It automatically
                    titles, categorizes, and tags your items for maximum
                    discoverability in your neighborhood.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: "imagesmode", label: "Auto-Tagging" },
                    { icon: "local_offer", label: "Smart Pricing" },
                    { icon: "location_on", label: "Local SEO" },
                    { icon: "search_check", label: "High Visibility" },
                  ].map((f) => (
                    <div
                      key={f.label}
                      className="bg-gray-50 p-4 rounded-xl flex items-center gap-3"
                    >
                      <span className="material-symbols-outlined text-primary">
                        {f.icon}
                      </span>
                      <span className="text-sm font-bold text-charcoal">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full bg-primary/5 px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto bg-charcoal text-white rounded-2xl lg:rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <span className="material-symbols-outlined text-[10rem]">eco</span>
            </div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl sm:text-5xl lg:text-5xl font-bold">
                Ready to start sharing?
              </h2>
              <p className="text-white/70 text-base sm:text-lg">
                Join your local community today and help create a more
                sustainable future, one shared item at a time.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-4 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-primary outline-none text-white placeholder:text-white/50"
                />
                <button type="button" className="px-8 py-4 bg-primary rounded-lg font-bold hover:brightness-110 transition-all">
                  Get Started
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-50 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 lg:mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <svg
                  className="size-5 text-white"
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-charcoal">ShareMore</h2>
            </div>
            <p className="text-sm text-muted-green leading-relaxed">
              Making community sharing safe, easy, and sustainable. Join the
              circular economy today.
            </p>
            <div className="flex gap-4">
              {["public", "chat_bubble", "camera"].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-charcoal hover:text-primary hover:border-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-base">
                    {icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: "Platform",
              links: [
                "How it Works",
                "Trust & Safety",
                "Community Rules",
                "Marketplace",
              ],
            },
            {
              title: "Company",
              links: ["About Us", "Careers", "Sustainability Report", "Press"],
            },
            {
              title: "Support",
              links: ["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"],
            },
          ].map((col) => (
            <div key={col.title} className="space-y-6">
              <h4 className="font-bold text-charcoal">{col.title}</h4>
              <ul className="space-y-3 text-sm text-muted-green">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-primary transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-center text-xs text-muted-green">
          <p>© 2026 ShareMore Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
