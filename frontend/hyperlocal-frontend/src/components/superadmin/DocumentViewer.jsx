import { useState } from 'react';

/**
 * DocumentViewer Component
 * Image preview with zoom modal for viewing uploaded documents
 */
export default function DocumentViewer({ documents }) {
  const [selectedDoc, setSelectedDoc] = useState(null);

  return (
    <>
      {/* Document Grid */}
      <div className="grid grid-cols-2 gap-4">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
            onClick={() => setSelectedDoc(doc)}
          >
            <div className="aspect-video bg-gray-100 relative">
              <img
                src={doc.url}
                alt={doc.type}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-white opacity-0 hover:opacity-100 text-3xl drop-shadow-lg">
                  zoom_in
                </span>
              </div>
            </div>
            <div className="p-3 bg-white">
              <p className="text-sm font-medium text-gray-900">{doc.type}</p>
              <p className="text-xs text-gray-500">Uploaded {doc.uploadedAt}</p>
            </div>
          </div>
        ))}
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
              src={selectedDoc.url}
              alt={selectedDoc.type}
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 rounded-b-lg">
              <p className="font-medium">{selectedDoc.type}</p>
              <p className="text-sm text-gray-300">Uploaded {selectedDoc.uploadedAt}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
