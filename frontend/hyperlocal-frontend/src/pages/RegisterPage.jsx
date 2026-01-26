import SidebarBenefits from '../components/ui/SidebarBenefits';
import RegisterForm from '../components/ui/RegisterForm';

const RegisterPage = () => (
  <div className="h-screen bg-background-light dark:bg-background-dark font-display text-charcoal dark:text-white transition-colors duration-300 flex overflow-hidden">
    <SidebarBenefits />
    <main className="flex-1 flex flex-col justify-center items-center p-4 lg:p-6 overflow-hidden">
      <RegisterForm />
    </main>
  </div>
);

export default RegisterPage;