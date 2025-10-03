import { X } from 'lucide-react';
import { Button } from './Button';

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  title?: string;
}

export function MediaPreviewModal({ isOpen, onClose, mediaType, mediaUrl, title }: MediaPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      data-testid="modal-media-preview"
    >
      <div 
        className="relative max-w-7xl max-h-[90vh] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute -top-12 right-0 text-white hover:text-white hover:bg-white/10"
          data-testid="button-close-preview"
        >
          <X className="h-6 w-6" />
        </Button>

        {title && (
          <h3 className="absolute -top-12 left-0 text-white text-lg font-semibold">
            {title}
          </h3>
        )}

        <div className="flex items-center justify-center">
          {mediaType === 'image' ? (
            <img
              src={mediaUrl}
              alt={title || 'Preview'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              data-testid="img-preview"
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="max-w-full max-h-[90vh] rounded-lg"
              data-testid="video-preview"
            >
              Tu navegador no soporta el elemento de video.
            </video>
          )}
        </div>
      </div>
    </div>
  );
}