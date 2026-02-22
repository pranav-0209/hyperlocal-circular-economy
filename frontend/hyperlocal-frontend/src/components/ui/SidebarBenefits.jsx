import { Link } from 'react-router-dom';

const benefits = [
  { icon: 'recycling', title: 'Reduce Waste Together', desc: 'Lend what you own, borrow what you need. Every exchange keeps items out of landfill.' },
  { icon: 'verified_user', title: 'Verified Members Only', desc: 'Every user is ID-verified and tied to a real local community. No strangers, ever.' },
  { icon: 'handshake', title: 'Build Trust, Earn Reputation', desc: 'Your trust score grows with every exchange and unlocks more of the platform.' },
  { icon: 'location_on', title: 'Hyperlocal by Design', desc: 'Everything stays within your community boundary. Pick up in minutes, not days.' },
];

const SidebarBenefits = () => (
  <aside className="hidden lg:flex lg:w-[45%] flex-col justify-center p-12 border-r border-gray-200 bg-background-light">
    {/* Logo */}
    <Link to="/" className="flex items-center gap-2.5 mb-12 w-fit">
      <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
        <span className="material-symbols-outlined text-white text-lg">share</span>
      </div>
      <span className="font-bold text-xl tracking-tight text-charcoal">ShareMore</span>
    </Link>

    {/* Headline */}
    <div className="mb-10">
      <h2 className="text-3xl font-bold leading-tight text-charcoal mb-3">
        Your neighbourhood,<br />
        <span className="text-primary">reimagined.</span>
      </h2>
      <p className="text-muted-green text-sm leading-relaxed max-w-xs">
        A circular economy platform for real communities — share more, waste less.
      </p>
    </div>

    {/* Benefits list */}
    <div className="space-y-7">
      {benefits.map(({ icon, title, desc }) => (
        <div key={title} className="flex gap-4">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-charcoal">{title}</h4>
            <p className="text-xs text-muted-green/75 mt-1 leading-relaxed">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </aside>
);

export default SidebarBenefits;