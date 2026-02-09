import SuperAdminSidebar from './SuperAdminSidebar';

/**
 * SuperAdminLayout Component
 * Main layout wrapper for all super admin pages
 */
export default function SuperAdminLayout({ children, title }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
