/**
 * PageLoader Component
 * Loading fallback for lazy-loaded pages
 */
const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
        <p className="text-muted-green text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default PageLoader;
