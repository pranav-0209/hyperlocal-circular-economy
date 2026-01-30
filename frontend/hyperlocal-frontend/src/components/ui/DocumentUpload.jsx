/**
 * DocumentUpload Component
 * Reusable component for document file uploads.
 */
export default function DocumentUpload({
  title,
  description,
  acceptedFormats = 'image/*, .pdf',
  onFileSelected,
  selectedFile,
  error,
  icon = 'upload_file',
}) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 transition-colors hover:border-primary hover:bg-primary/5">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-400">
              {icon}
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-charcoal mb-1">{title}</h3>
        <p className="text-sm text-muted-green mb-4">{description}</p>

        {selectedFile ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600">
                  check_circle
                </span>
                <div>
                  <p className="text-sm font-medium text-green-700">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-green-600">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onFileSelected(null)}
                className="text-green-600 hover:text-green-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        ) : (
          <label className="inline-block cursor-pointer">
            <input
              type="file"
              accept={acceptedFormats}
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="text-primary font-medium hover:underline">Click to upload</span>
            {' or drag and drop'}
          </label>
        )}

        {error && (
          <p className="text-red-500 text-sm mt-3">{error}</p>
        )}

        <p className="text-xs text-muted-green mt-3">
          Max file size: 5MB
        </p>
      </div>
    </div>
  );
}
