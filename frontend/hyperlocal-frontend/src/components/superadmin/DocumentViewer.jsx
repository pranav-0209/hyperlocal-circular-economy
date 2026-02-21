import { useState, useEffect } from 'react';

/**
 * DocumentViewer Component
 * Image preview with zoom modal for viewing uploaded documents
 * Handles authenticated image loading with admin token
 */
export default function DocumentViewer({ documents }) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // Fetch images with authentication
  useEffect(() => {
    const loadAuthenticatedImages = async () => {
      const adminToken = localStorage.getItem('adminToken');
      
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        try {
          const response = await fetch(doc.url, {
            headers: {
              'Authorization': `Bearer ${adminToken}`,
            },
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            
            // Store both the URL and file type
            setImageUrls((prev) => ({ 
              ...prev, 
              [i]: {
                url: objectUrl,
                type: blob.type,
                isPdf: blob.type === 'application/pdf'
              }
            }));
          } else {
            console.error(`Failed to load ${doc.type}:`, response.status);
            setImageErrors((prev) => ({ ...prev, [i]: true }));
          }
        } catch (error) {
          console.error(`Error loading ${doc.type}:`, error);
          setImageErrors((prev) => ({ ...prev, [i]: true }));
        }
      }
    };

    if (documents.length > 0) {
      loadAuthenticatedImages();
    }

    // Cleanup object URLs on re-run/unmount
    return () => {
      Object.values(imageUrls).forEach((item) => {
        if (item && item.url) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  // imageUrls is read-only in cleanup; adding it to deps would re-trigger fetches on every URL update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents]);

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
    console.error('Failed to display document image:', documents[index]);
  };

  return (
    <>
      {/* Document Grid */}
      <div className="grid grid-cols-2 gap-4">
        {documents.map((doc, index) => {
          const docData = imageUrls[index];
          const isPdf = docData?.isPdf;
          
          return (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
              onClick={() => {
                if (isPdf && docData) {
                  // Open PDF in new tab
                  window.open(docData.url, '_blank');
                } else if (docData) {
                  // Show image in modal
                  setSelectedDoc({ ...doc, displayUrl: docData.url });
                }
              }}
            >
              <div className="aspect-video bg-gray-100 relative">
                {!docData && !imageErrors[index] ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined text-5xl mb-2 animate-pulse">image</span>
                    <p className="text-sm">Loading...</p>
                  </div>
                ) : imageErrors[index] ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined text-5xl mb-2">broken_image</span>
                    <p className="text-sm">Failed to load</p>
                  </div>
                ) : isPdf ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-red-600">
                    <span className="material-symbols-outlined text-6xl mb-2">picture_as_pdf</span>
                    <p className="text-sm font-medium">PDF Document</p>
                    <p className="text-xs text-gray-500">Click to open</p>
                  </div>
                ) : (
                  <>
                    <img
                      src={docData.url}
                      alt={doc.type}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(index)}
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="material-symbols-outlined text-white opacity-0 hover:opacity-100 text-3xl drop-shadow-lg">
                        zoom_in
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="p-3 bg-white">
                <p className="text-sm font-medium text-gray-900">{doc.type}</p>
                <p className="text-xs text-gray-500">
                  {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }) : 'Uploaded'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zoom Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDoc(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            <img
              src={selectedDoc.displayUrl}
              alt={selectedDoc.type}
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 rounded-b-lg">
              <p className="font-medium">{selectedDoc.type}</p>
              <p className="text-sm text-gray-300">
                {selectedDoc.uploadedAt ? new Date(selectedDoc.uploadedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }) : 'Uploaded'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
