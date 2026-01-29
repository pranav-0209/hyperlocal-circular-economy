import SidebarBenefits from '../components/ui/SidebarBenefits';
import LoginForm from '../components/ui/LoginForm';

const LoginPage = () => (
  <div className="h-screen bg-background-light font-display text-charcoal flex lg:flex-row overflow-hidden">
    {/* Desktop Sidebar - Hidden on mobile */}
    <SidebarBenefits />

    {/* Main Content */}
    <main className="flex-1 flex items-center justify-center w-full px-4 sm:px-6 overflow-y-auto lg:overflow-y-visible">
      <div className="w-full max-w-md py-12 lg:py-0">
        <LoginForm />
      </div>
    </main>
  </div>
);

export default LoginPage;
