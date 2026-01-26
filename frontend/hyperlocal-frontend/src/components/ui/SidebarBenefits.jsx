const SidebarBenefits = () => (
  <aside className="hidden lg:flex lg:w-[40%] flex-col justify-between p-8 border-r border-gray-100 dark:border-gray-800 bg-gradient-to-br from-emerald-500/5 via-orange-500/5 to-emerald-500/5 relative overflow-hidden">
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 bg-[#31816d] rounded-lg flex items-center justify-center text-white text-sm font-bold">
          SG
        </div>
        <span className="font-bold text-lg tracking-tight">ShareGrowth</span>
      </div>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold leading-tight mb-3">
            Start Sharing.<br />Start Growing.
          </h2>
          <p className="text-emerald-700 text-base max-w-sm">
            Join the world's most trusted neighborhood sharing platform.
          </p>
        </div>
        <div className="space-y-6">
          {[
            { title: 'Reduce Waste', desc: 'Saved 4.2 tons of landfill waste through localized sharing.' },
            { title: 'Build Trust', desc: 'Verified Trust Score™ based on community feedback.' },
            { title: 'Local First', desc: 'Connect with neighbors within walking distance.' }
          ].map(({ title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0 text-sm">
                •
              </div>
              <div>
                <h4 className="font-bold text-sm">{title}</h4>
                <p className="text-xs text-emerald-700">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
  </aside>
);

export default SidebarBenefits;