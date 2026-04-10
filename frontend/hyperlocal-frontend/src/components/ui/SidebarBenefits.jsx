import { Link } from 'react-router-dom';

/* 3 benefits only, one-line descriptions */
const benefits = [
  {
    icon: 'package_2',
    title: "Borrow, Don't Buy",
    desc: 'Get what you need from a verified neighbour — no purchase required.',
    color: 'rgba(5,128,116,0.15)',
    iconColor: 'var(--color-primary)',
  },
  {
    icon: 'payments',
    title: 'Earn from Idle Items',
    desc: 'Lend out things at home and turn unused items into value.',
    color: 'rgba(217,119,87,0.14)',
    iconColor: '#d97757',
  },
  {
    icon: 'handshake',
    title: 'Build Local Trust',
    desc: 'Every exchange grows your community trust score.',
    color: 'rgba(5,128,116,0.15)',
    iconColor: 'var(--color-primary)',
  },
];

function Logo() {
  return (
    <svg className="size-5 text-white" fill="none" viewBox="0 0 48 48">
      <path
        d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* No dark mode toggle — that lives in the right panel only */
const SidebarBenefits = () => (
  <aside
    className="hidden lg:flex lg:w-[42%] flex-col h-screen overflow-hidden relative shrink-0"
    style={{
      background: 'linear-gradient(160deg, #0d1f1b 0%, #1a3329 45%, #0f2820 100%)',
    }}
  >
    {/* Decorative glows */}
    <div
      className="absolute top-0 left-0 w-72 h-72 rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(5,128,116,0.22) 0%, transparent 65%)',
        filter: 'blur(55px)',
        transform: 'translate(-30%, -30%)',
      }}
    />
    <div
      className="absolute bottom-0 right-0 w-56 h-56 rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(217,119,87,0.14) 0%, transparent 65%)',
        filter: 'blur(45px)',
        transform: 'translate(25%, 25%)',
      }}
    />

    <div className="relative z-10 flex flex-col h-full px-9 py-10 xl:px-11">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 group w-fit mb-10">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30 group-hover:brightness-110 transition-all">
          <Logo />
        </div>
        <span
          className="text-[1.1rem] font-bold text-white tracking-tight"
          style={{ fontFamily: 'var(--font-family-heading)' }}
        >
          ShareMore
        </span>
      </Link>

      {/* Pill + headline */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 border border-primary/30 mb-4">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '0.85rem' }}>location_on</span>
          <span className="text-[0.65rem] font-bold text-primary/90 uppercase tracking-widest">
            Hyperlocal · Invite-Only
          </span>
        </div>
        <h2
          className="text-white leading-[1.1] mb-3"
          style={{
            fontFamily: 'var(--font-family-heading)',
            fontWeight: 800,
            fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)',
          }}
        >
          Your neighbourhood,
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #31816d 0%, #5eb89e 50%, #d97757 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            reimagined.
          </span>
        </h2>
        <p className="text-white/45 text-sm leading-relaxed max-w-xs">
          A circular economy platform for verified local communities.
        </p>
      </div>

      {/* 3 benefits — no footer row */}
      <div className="flex flex-col gap-4">
        {benefits.map(({ icon, title, desc, color, iconColor }) => (
          <div
            key={title}
            className="flex gap-3.5 px-4 py-4 rounded-2xl border"
            style={{
              background: 'rgba(255,255,255,0.045)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: color }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: iconColor, fontSize: '1.1rem' }}
              >
                {icon}
              </span>
            </div>
            <div>
              <h4
                className="text-white text-[0.85rem] font-semibold leading-snug mb-0.5"
                style={{ fontFamily: 'var(--font-family-heading)' }}
              >
                {title}
              </h4>
              <p className="text-white/42 text-xs leading-relaxed">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </aside>
);

export default SidebarBenefits;