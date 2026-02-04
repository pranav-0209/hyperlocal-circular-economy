const SidebarBenefits = () => (
  <aside className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 border-r border-gray-200 bg-linear-to-br from-primary/5 via-accent/5 to-primary/5 relative overflow-hidden">
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
          SG
        </div>
        <span className="font-bold text-lg tracking-tight text-charcoal">ShareMore</span>
      </div>
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4 text-charcoal">
            Start Sharing.<br />Start Growing.
          </h2>
          <p className="text-muted-green text-base max-w-sm leading-relaxed">
            Join the world's most trusted neighborhood sharing platform.
          </p>
        </div>
        <div className="space-y-7">
          {[
            { title: 'Reduce Waste', desc: 'Saved 4.2 tons of landfill waste through localized sharing.' },
            { title: 'Build Trust', desc: 'Verified Trust Score™ based on community feedback.' },
            { title: 'Local First', desc: 'Connect with neighbors within walking distance.' }
          ].map(({ title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0 text-lg font-bold">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-base text-charcoal">{title}</h4>
                <p className="text-sm text-muted-green/80 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
  </aside>
);

export default SidebarBenefits;