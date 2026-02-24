import { NavLink, useNavigate } from 'react-router-dom';

/**
 * SuperAdminSidebar Component
 * Navigation sidebar for super admin dashboard
 */
export default function SuperAdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/superadmin/login');
  };

  const navItems = [
    { path: '/superadmin', icon: 'dashboard', label: 'Dashboard', exact: true },
    { path: '/superadmin/verifications', icon: 'verified_user', label: 'Verifications' },
    { path: '/superadmin/users', icon: 'group', label: 'Users' },
    { path: '/superadmin/communities', icon: 'location_city', label: 'Communities' },
  ];

  return (
    <aside className="w-64 bg-gray-900 h-screen flex flex-col shrink-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <svg className="size-6 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold text-white">ShareMore</span>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
