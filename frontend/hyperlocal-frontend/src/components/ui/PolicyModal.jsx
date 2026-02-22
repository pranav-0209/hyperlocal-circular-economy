import { useEffect } from 'react';

const SECTIONS = [
  {
    heading: 'Terms of Service',
    icon: 'gavel',
    items: [
      { title: 'Eligibility', body: 'ShareMore is available to verified residents of registered communities. You must be at least 18 years old and complete identity verification before listing or borrowing items.' },
      { title: 'Sharing Responsibility', body: 'All items listed must be your own property. You are responsible for their condition at the time of lending. Borrowers must return items in the same state or cover reasonable repair costs.' },
      { title: 'Community Guidelines', body: 'Treat every member with respect. Harassment, misrepresentation of items, or repeated no-shows will result in suspension from your community or the platform.' },
      { title: 'No Commercial Activity', body: 'ShareMore is a non-commercial sharing network. Selling items or charging money for lending is not permitted. The platform is purely for community exchange.' },
      { title: 'Account Termination', body: 'We reserve the right to suspend or permanently remove accounts that violate these terms or engage in fraudulent activity.' },
    ],
  },
  {
    heading: 'Privacy Policy',
    icon: 'privacy_tip',
    items: [
      { title: 'Information We Collect', body: 'We collect your name, email address, phone number, and address for identity verification and community matching. Profile photos and bio are optional.' },
      { title: 'How We Use Your Data', body: 'Your data is used to verify your identity, connect you with your local community, enable item sharing, and send important notifications.' },
      { title: 'Location Information', body: 'Your address places you in the correct local community. We never share precise location data with other users — only your community name is visible.' },
      { title: 'Data Sharing', body: 'We do not sell your personal data to third parties. Your name and profile photo may be visible to members within your verified community for trust and transparency.' },
      { title: 'Your Rights', body: 'You may request access to, correction of, or deletion of your personal data at any time. Account deletion removes all personal information within 30 days.' },
    ],
  },
];

export default function PolicyModal({ onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-base text-charcoal">Terms &amp; Privacy Policy</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 py-5 flex-1 space-y-8">
          {SECTIONS.map(({ heading, icon, items }) => (
            <div key={heading}>
              {/* Section heading */}
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
                <h3 className="font-bold text-sm text-charcoal">{heading}</h3>
              </div>
              <div className="space-y-4">
                {items.map(({ title, body }) => (
                  <div key={title}>
                    <p className="font-semibold text-xs text-charcoal mb-0.5">{title}</p>
                    <p className="text-xs text-muted-green leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            Last updated: February 2026 · ShareMore Platform
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
